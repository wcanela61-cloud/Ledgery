// Ledgery ← Stripe webhooks. Keeps public.subscriptions in step with Stripe: trials
// starting and ending, renewals, failed payments, plan switches and cancellations.
// Deploy with JWT verification OFF (Stripe doesn't send a Supabase login); every
// request is checked against Stripe's signature instead.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   STRIPE_API_KEY         same restricted key as the billing function
//   STRIPE_WEBHOOK_SECRET  whsec_… from the webhook endpoint in Stripe
import Stripe from 'npm:stripe@22.6.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') ?? '', {
  apiVersion: '2026-08-26.dahlia',
  httpClient: Stripe.createFetchHttpClient(),
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
  auth: { persistSession: false },
});
const LIVE = ['trialing', 'active', 'past_due'];
const iso = (seconds?: number | null) => (seconds ? new Date(seconds * 1000).toISOString() : null);

// Always re-read the subscription from Stripe, so events arriving out of order
// can't leave an old state behind. The Stripe customer ID is what ties it to a person.
async function syncSubscription(subscriptionId: string) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const { data: row, error } = await admin.from('subscriptions')
    .select('user_id, stripe_subscription_id, status').eq('stripe_customer_id', customerId).maybeSingle();
  if (error) throw error;
  if (!row) { console.log('no Ledgery account for customer', customerId); return; }
  // An old, ended subscription must not overwrite a newer live one.
  if (row.stripe_subscription_id && row.stripe_subscription_id !== sub.id && LIVE.includes(row.status ?? '') && !LIVE.includes(sub.status)) return;
  const item = sub.items.data[0];
  const update = await admin.from('subscriptions').update({
    stripe_subscription_id: sub.id,
    status: sub.status,
    price_id: item?.price.id ?? null,
    billing_interval: item?.price.recurring?.interval ?? null,
    trial_end: iso(sub.trial_end),
    current_period_end: iso(item?.current_period_end),
    cancel_at_period_end: sub.cancel_at_period_end || !!sub.cancel_at,
    ...(sub.trial_start ? { trial_used: true } : {}),
    updated_at: new Date().toISOString(),
  }).eq('user_id', row.user_id);
  if (update.error) throw update.error;
}

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === 'string' ? v : v?.id);

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  const payload = await req.text(); // the raw body: signature checks fail on re-serialized JSON
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      payload, req.headers.get('stripe-signature') ?? '', Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '', undefined, cryptoProvider,
    );
  } catch {
    return new Response('invalid signature', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.payment_status !== 'unpaid') {
          const id = idOf(session.subscription);
          if (id) await syncSubscription(id);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
      case 'customer.subscription.trial_will_end':
        await syncSubscription(event.data.object.id);
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const id = idOf(event.data.object.parent?.subscription_details?.subscription);
        if (id) await syncSubscription(id);
        break;
      }
      default:
        break; // not needed; Stripe only sends the events chosen on the endpoint
    }
  } catch (e) {
    const err = e as { type?: string; code?: string; message?: string };
    console.error('webhook failed', event.type, event.id, err.type ?? '', err.code ?? '', err.message ?? '');
    return new Response('retry later', { status: 500 }); // Stripe retries with backoff
  }
  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
});

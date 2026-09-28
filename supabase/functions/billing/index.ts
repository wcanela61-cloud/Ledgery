// Ledgery billing: starts Stripe Checkout, opens the Customer Portal, and cancels a
// subscription when someone deletes their account. Called from index.html with the
// signed-in person's session; the Stripe key never leaves this function.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   STRIPE_API_KEY        restricted key (rk_…) — see README → Billing for its permissions
//   STRIPE_PRICE_MONTHLY  price_… for $9 a month
//   STRIPE_PRICE_YEARLY   price_… for $90 a year
//   SITE_URL              where Ledgery lives, e.g. https://wcanela61-cloud.github.io/Ledgery/
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
import Stripe from 'npm:stripe@22.6.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY') ?? '', {
  apiVersion: '2026-08-26.dahlia',
  httpClient: Stripe.createFetchHttpClient(),
});
const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
  auth: { persistSession: false },
});

const SITE_URL = Deno.env.get('SITE_URL') ?? '';
const PRICES: Record<string, string | undefined> = {
  month: Deno.env.get('STRIPE_PRICE_MONTHLY'),
  year: Deno.env.get('STRIPE_PRICE_YEARLY'),
};
const TRIAL_DAYS = 7;
const LIVE = ['trialing', 'active', 'past_due'];
// Tags these Checkout Sessions in the Stripe Dashboard so this flow can be tracked.
const INTEGRATION_ID = 'ledgery-pro-signup-qhtwmzkd';

// Only the Ledgery site may call this function from a browser.
const cors = {
  'Access-Control-Allow-Origin': SITE_URL ? new URL(SITE_URL).origin : '',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// Links every Ledgery account to exactly one Stripe customer.
async function customerFor(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const found = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
  if (found.error) throw found.error;
  if (found.data) return found.data.stripe_customer_id as string;
  const name = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined;
  // The idempotency key makes two quick clicks create one customer, not two.
  const customer = await stripe.customers.create(
    { email: user.email, name, metadata: { supabase_user_id: user.id } },
    { idempotencyKey: `ledgery-customer-${user.id}` },
  );
  const saved = await admin.from('subscriptions').insert({ user_id: user.id, stripe_customer_id: customer.id });
  if (saved.error && saved.error.code !== '23505') throw saved.error; // 23505: the other click saved it first
  return customer.id;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: auth } = await admin.auth.getUser(token);
  const user = auth?.user;
  if (!user) return json({ error: 'not_signed_in' }, 401);

  let body: { action?: string; plan?: string } = {};
  try { body = await req.json(); } catch { /* empty body */ }

  try {
    if (body.action === 'checkout') {
      const price = PRICES[body.plan ?? ''];
      if (!price) return json({ error: 'unknown_plan' }, 400);
      const customer = await customerFor(user);
      const { data: row } = await admin.from('subscriptions').select('status, trial_used').eq('user_id', user.id).maybeSingle();
      if (row && LIVE.includes(row.status ?? '')) return json({ error: 'already_subscribed' }, 409);
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer,
        client_reference_id: user.id,
        line_items: [{ price, quantity: 1 }],
        // One free trial per person; a card is collected up front either way.
        subscription_data: row?.trial_used ? undefined : { trial_period_days: TRIAL_DAYS },
        payment_method_collection: 'always',
        allow_promotion_codes: true,
        success_url: `${SITE_URL}?billing=success`,
        cancel_url: `${SITE_URL}?billing=cancel`,
        integration_identifier: INTEGRATION_ID,
      });
      return json({ url: session.url });
    }

    if (body.action === 'portal') {
      const customer = await customerFor(user);
      const portal = await stripe.billingPortal.sessions.create({ customer, return_url: `${SITE_URL}?billing=portal` });
      return json({ url: portal.url });
    }

    if (body.action === 'cancel') {
      // Account deletion: deleting the Stripe customer cancels its subscriptions immediately,
      // so nobody keeps getting charged for an account that no longer exists.
      const { data: row } = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
      if (row) {
        try { await stripe.customers.del(row.stripe_customer_id); } catch (e) {
          if ((e as { code?: string }).code !== 'resource_missing') throw e;
        }
        await admin.from('subscriptions').delete().eq('user_id', user.id);
      }
      return json({ ok: true });
    }

    return json({ error: 'unknown_action' }, 400);
  } catch (e) {
    const err = e as { type?: string; code?: string; message?: string };
    console.error('billing failed', body.action, err.type ?? '', err.code ?? '', err.message ?? ''); // never logs keys
    return json({ error: 'billing_failed' }, 502);
  }
});

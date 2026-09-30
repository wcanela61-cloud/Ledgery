# Ledgery — Reseller Dashboard

A single-file web app for resellers: track what you buy, what you sell, and what you actually make.

## Usage

Open `index.html` in a browser — no build step or server required. The app starts empty.

- **Inventory** — add items with product details (name; Men's, Women's or Kids, then a category, then a size from a list that fits it — letter sizes, waist or numeric sizes, kids/toddler/baby sizes, shoe sizes for footwear, or your own; brand, color, condition), the purchase (an automatic order number like `ORD-260927-1432-K7QX`, date and time purchased, total spent ÷ quantity = cost per item). Buying several of the same thing makes one **batch**: a single row that opens to show each unit, edited all at once with **Edit batch** (including changing the quantity), while each unit can still sell on its own, listing status, listing price, photos and notes. Or add a bundle: one price split evenly across several different items. Switch between a table and a photo grid; items without photos get an icon for their category.
- **Sales** — record a sale, creating the item on the spot if it isn't in inventory yet. Platform fees are pre-filled from each platform's rate (editable in Settings).
- **Ledger** — a pencil you can chat with about your business ("How much did I make this month?", "What's been sitting unsold the longest?"). Inside the Claude preview it answers with Claude, using a summary of your inventory and sales (the first question asks your permission, and answers use your own Claude usage). Opened anywhere else, it answers common questions itself from your numbers. Claude answers are limited to 5 a day (**Analyze my business**, a full report, uses 2); after that, and whenever Claude isn't available, Ledger uses its built-in answers, which are unlimited.
- **Dashboard** — this month / this year / all time, with trends vs. last period, a monthly profit goal ring (set it in Settings) and your top 3 sellers.
- **Analytics** — monthly revenue and net profit, sell-through, days to sell, and per-platform and per-category results.

## Money & dates

**Settings → Money & dates** sets the currency (USD, CAD, GBP, EUR, AUD, MXN), number style (1,234.56 · 1.234,56 · 1 234,56), date style, and which day your week starts. It's used everywhere: the Dashboard, tables, charts, Ledger and the fee editor. The Dashboard's **This week** view follows your week start. Changing currency changes the symbol only; amounts aren't converted. With an account, these sync to your other devices.

## Item codes

Every item gets a code like `LGY-09182`. Search it in Inventory (the digits alone work too) to see every purchase of that item. When you buy the same thing again, type its code (or name) in **Add item → Buying something again?** and the form fills in from last time and keeps the same code. Units in a batch share one code.

**Selling several at once:** when an item has more than one in stock, Record sale shows **How many did you sell?**. Enter the order's totals (price, fees, shipping); they're split across the units, which are taken oldest-first so each keeps its own cost. The order shows as one "×N" row in Sales. Every in-stock row and card in Inventory has a **Sell** button that opens Record sale with that item picked.

**Returns:** marking a sale **Returned** puts the unit back in stock (Not listed, or Listed if it was listed) at its original cost and place in line, with a small "↩ returned" stamp. The **Returned** filter in Inventory shows them.

Buying more of something you still have in stock? When you save it, Ledgery asks whether to **add it to your existing stock** (for example "You have 42 of 100 left"). Stock is sold **first in, first out**: each sale uses the cost of the oldest units left, so 100 bought at $9.87 then 100 at $8.88 sell as 100 × $9.87 followed by 100 × $8.88. Costs are never averaged.

**Inventory → Recent additions** lists every time you added stock, newest first, with the date and time to the second (items added before this feature show their purchase date instead). Filter to the last 7 or 30 days, search by item, code or order number, and **Remove** an addition you made by mistake; Undo brings it back.

Made a mistake? **Inventory → LGY codes** lists every code with its item. **Change** gives a code a new number (or type another item's code to combine them), and **×** deletes a code along with its items. Both can be undone right after.

## Your data

Everything is saved in the browser (items and sales in `localStorage`, photos in IndexedDB), so it stays when you reload but lives only in that browser. Use **Settings → Data & backup** to download a backup file (and restore it on another device), or export CSV files for spreadsheets. **Erase all data** clears everything; deletes and erases can be undone for a few seconds.

## Accounts (optional)

Out of the box, data is saved only in the browser. To let people **create an account, sign in, and sync across devices**, connect a free [Supabase](https://supabase.com) project:

1. **Create a project** at supabase.com (free plan is fine). Pick any name and a strong database password.
2. **Create the tables:** open **SQL Editor → New query**, paste everything from [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This also turns on row-level security, so each person can only ever read their own data. *Set up with an older copy?* Run [`supabase/photos.sql`](supabase/photos.sql) (photo sync) and [`supabase/delete-account.sql`](supabase/delete-account.sql) (the **Delete account** button) once each.
3. **Copy your keys:** **Project Settings → API**. Copy the **Project URL** and the **anon public** key into `index.html`, near the top of the script:
   ```js
   const LEDGERY_SUPABASE = {
     url: 'https://YOUR-PROJECT.supabase.co',
     anonKey: 'eyJ...your anon public key...',
     requireSignIn: true,                       // false = sign-in is optional
     providers: { google: true, apple: false }, // "Continue with …" buttons
   };
   ```
   The anon key is designed to be public; never paste the `service_role` key.
4. **Host Ledgery on a website** (for example GitHub Pages: repo **Settings → Pages → Deploy from branch**). Accounts need a real web address; they don't work from a file opened on your computer or inside the Claude preview.
5. **Tell Supabase your address:** **Authentication → URL Configuration**: set **Site URL** to your Ledgery address (e.g. `https://you.github.io/Ledgery/`) and add it under **Redirect URLs**. This is where email confirmation and password-reset links send people.

6. **Turn on "Continue with Google"** (optional; set `google: false` to hide the button):
   1. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → OAuth consent screen**: set it up as **External**, with your app name and email.
   2. **Credentials → Create credentials → OAuth client ID → Web application.** Under **Authorized redirect URIs** add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` (Supabase shows this exact address on its Google page).
   3. Copy the **Client ID** and **Client secret** into Supabase → **Authentication → Sign In / Providers → Google**, switch it on, and save.
7. **"Continue with Apple"** (optional) needs a paid Apple Developer account: create a Services ID and key, then paste them in Supabase → **Authentication → Sign In / Providers → Apple** and set `apple: true`. If a button is shown but its provider isn't switched on, people get a friendly "use email for now" message.

How it behaves:
- With `requireSignIn: true`, Ledgery opens on a sign-in page and the dashboard appears once you're signed in. Sign up asks for your name and (optionally) your shop name; email sign-ups confirm their address by email; "Forgot password?" sends a reset link. If the account service can't be reached at all, Ledgery falls back to working in the browser so nobody is locked out.
- You can confirm your email on a different device (e.g. sign up on a laptop, tap the link on your phone). The page that's waiting on "Check your email" keeps checking and signs itself in once you've confirmed (for up to 30 minutes; after that, just sign in).
- Your name greets you on the dashboard and your shop name shows in the sidebar. Change them in **Settings → Account → Edit profile**.
- Items, sales, platform fee rates and the monthly goal sync automatically a moment after each change, and pull down when you come back to the tab.
- If a browser and the account both have different data (e.g. first sign-in on a computer you'd already been using), Ledgery asks which to keep instead of guessing.
- Two devices can't silently overwrite each other: every save carries a version number, and a stale save stops and re-syncs.
- Signing out removes the data from that browser (it stays in the account), so shared computers stay private.
- Photos sync too (after the photos table exists): each device uploads photos the others don't have and downloads the ones it's missing. Settings → Account shows how many are synced. Theme, font and Ledger chat history stay per device.
- **Settings → Account → Delete account** (type DELETE to confirm) permanently removes the login, ledger and photos. Without `delete-account.sql` it still deletes the ledger and photos, and tells the person to contact you to remove the login.

## Bot protection (CAPTCHA)

Ledgery supports [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/). It's free and usually invisible: people only see a checkbox if Cloudflare isn't sure they're human. The check runs on sign-up, sign-in and password reset. While a laptop waits on "Check your email", each background sign-in try gets its own check too, every 12 seconds instead of 4.

Do the steps **in this order**. If Supabase starts requiring a CAPTCHA before the site sends one, nobody can sign in.

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/) (a free account is fine), go to **Turnstile → Add widget**. Name it `Ledgery`, add your hostname (e.g. `wcanela61-cloud.github.io`, plus your own domain if you have one), and choose **Managed** mode.
2. Copy the **Site key** into `index.html`:
   ```js
   captcha: { siteKey: '0x4AAAA...' },
   ```
   Then deploy and check that you can still sign in.
3. In Supabase, go to **Authentication → Attack Protection → Enable CAPTCHA protection**, choose **Turnstile**, paste the **Secret key** and save.

To turn it off, switch it off in Supabase first, then empty `siteKey`.

## Billing (Stripe)

Ledgery is a paid app: **$9 a month or $90 a year, with a 7-day free trial** (card needed to start it). People sign up, then pick a plan on Stripe's own checkout page. Without a trial or subscription, the app shows the plans instead of the dashboard. Their data is kept either way.

How it fits together (the Stripe key never goes in `index.html`):
- [`supabase/functions/billing`](supabase/functions/billing/index.ts) opens Stripe Checkout, opens the Customer Portal ("Manage subscription"), and cancels the subscription when someone deletes their account.
- [`supabase/functions/stripe-webhook`](supabase/functions/stripe-webhook/index.ts) hears from Stripe (trial started, renewed, payment failed, cancelled…) and updates the `subscriptions` table.
- `index.html` reads that table. It's switched **off** (`billing: { enabled: false }`) until the steps below are done.

Do everything in a Stripe **sandbox** first (a test copy of your account where no real money moves), then repeat steps 1–4 and 6 in live mode to launch.

1. **Create a sandbox:** in the [Stripe Dashboard](https://dashboard.stripe.com), open the account menu (top left) → **Sandboxes → Create sandbox**, and switch into it.
2. **Create the plan:** **Product catalog → Add product**. Name it `Ledgery`, add a **recurring** price of **$9 / month**, save, then **Add another price** of **$90 / year**. Copy both price IDs (`price_…`).
   **Tax code:** if your account has **Managed Payments** on (Stripe's default for new accounts: Stripe acts as the seller and handles sales tax and VAT), edit the product and set its **Tax code** to the SaaS code that fits your customers (see Stripe's [tax code guide](https://docs.stripe.com/tax/tax-codes)). Without one, checkout fails with "the product tax code is missing". Or turn Managed Payments off in **Settings → Managed Payments** and handle tax yourself.
3. **Create a restricted key** (safer than the secret key): **Developers → API keys → Create restricted key**, name it `Ledgery Supabase`, and set only these to the level shown: **Customers: Write, Checkout Sessions: Write, Customer portal: Write, Subscriptions: Read, Prices: Read, Products: Read**. Copy the key (`rk_test_…`). Don't paste it anywhere except step 6.
4. **Set up the Customer Portal:** **Settings → Billing → Customer portal**. Turn on: update payment methods, view invoices, **cancel subscriptions (at the end of the billing period)**, and **switch plans** (add the Ledgery product so people can move between monthly and yearly). Save.
5. **Emails:** **Settings → Billing → Subscriptions and emails**: turn on the **trial ending reminder** (card networks require it for trials) and **failed payment** emails. **Settings → Customer emails**: turn on receipts.
6. **Supabase:**
   1. **SQL Editor:** run [`supabase/billing.sql`](supabase/billing.sql) (already in `schema.sql` for new projects).
   2. **Edge Functions → Deploy a new function → Via editor.** Name it `billing` (all lowercase) and paste [`supabase/functions/billing/index.ts`](supabase/functions/billing/index.ts). Deploy. Do the same for `stripe-webhook` with [`supabase/functions/stripe-webhook/index.ts`](supabase/functions/stripe-webhook/index.ts), then open its **Details** and switch **Enforce JWT verification off** (Stripe can't sign in; the function checks Stripe's signature instead).
      Turn **Verify JWT off for both functions**: each one checks who is calling by itself (the signed-in person, or Stripe's signature).
      Check each function's URL: it's case-sensitive. If Supabase made it `/functions/v1/Billing`, set `functionName: 'Billing'` in `index.html` (it's already set that way for this project).
      *With the Supabase CLI instead:* `supabase functions deploy billing` and `supabase functions deploy stripe-webhook --no-verify-jwt`.
   3. **Edge Functions → Secrets**, add:
      | Name | Value |
      | --- | --- |
      | `STRIPE_API_KEY` | the `rk_test_…` key from step 3 |
      | `STRIPE_PRICE_MONTHLY` | the $9/month `price_…` |
      | `STRIPE_PRICE_YEARLY` | the $90/year `price_…` |
      | `SITE_URL` | `https://wcanela61-cloud.github.io/Ledgery/` (with the trailing `/`) |
      | `STRIPE_WEBHOOK_SECRET` | from step 7 |
7. **Webhook:** in Stripe, **Developers → Webhooks → Add destination**, endpoint URL `https://xbmclxwzanvrvsaddgib.supabase.co/functions/v1/stripe-webhook`, with these events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `customer.subscription.trial_will_end`, `invoice.paid`, `invoice.payment_failed`. Copy its **signing secret** (`whsec_…`) into the `STRIPE_WEBHOOK_SECRET` secret.
8. **Switch it on:** in `index.html`, set `billing: { enabled: true, … }` and deploy.
9. **Test** on the live site with Stripe's test cards (any future date, any CVC):
   - `4242 4242 4242 4242`: the trial starts; Settings → Account shows "Free trial · first payment …" and **Manage subscription**.
   - Cancel in **Manage subscription**: it shows when access ends. In the sandbox, cancel immediately from the Stripe Dashboard to see the plans screen come back.
   - `4000 0000 0000 0341`: the card is saved but the first charge fails. Use Stripe's **test clocks** to jump past the trial and see "payment failed".
   - Delete a test account: its Stripe customer and subscription disappear too.
10. **Go live:** activate your Stripe account (business and bank details), then repeat steps 2–5 and 7 in **live mode** and replace the four Stripe secrets with the live values (`rk_live_…`, live `price_…`, new `whsec_…`). Run through Stripe's [go-live checklist](https://docs.stripe.com/get-started/checklist/go-live).

**Sales tax:** with Managed Payments on, Stripe handles sales tax and VAT as the seller (it charges an extra fee for this). Without it, if you'll be charging US or EU customers, you may need to collect sales tax or VAT. Look at [Stripe Tax](https://docs.stripe.com/billing/taxes/collect-taxes) before launch. It's left off on purpose, because switching it on without a tax registration collects nothing and gives no error.

**Keeping keys safe:** Stripe keys live only in Supabase's secrets. Never commit one. `.githooks/pre-commit` blocks commits that contain one; turn it on once with `git config core.hooksPath .githooks`. If a key ever leaks, roll it straight away in **Developers → API keys**.

## Install as an app

Ledgery is installable (`manifest.webmanifest`, icons in `brand/`) and opens offline (`sw.js`): pages are always fetched fresh when online, so new deploys show up right away, and the last copy is used offline. Account and sync requests are never cached. **Settings → App** shows an **Install app** button where the browser supports it (Chrome, Edge, Android), and "Share → Add to Home Screen" instructions on iPhone. Shared links show a preview card (`brand/og-image.png`).

## Privacy & terms

[`privacy.html`](privacy.html) and [`terms.html`](terms.html) are linked from sign-up, the sign-in page and **Settings → App**. They are a plain-language starting point, not legal advice; have them reviewed if you charge money or have many users.

## Launch checklist

- [ ] Run `supabase/photos.sql` and `supabase/delete-account.sql` (or all of `schema.sql` on a new project).
- [ ] **Authentication → URL Configuration:** Site URL and Redirect URLs set to the live address.
- [x] **Authentication → SMTP:** sending through Gmail for now (smtp.gmail.com, port 587, a Google App Password), with the email rate limit raised to about 30 an hour.
- [ ] Once you have a domain: switch SMTP to a transactional sender (Resend, Postmark, SendGrid…) for better inbox delivery, then brand the email templates.
- [x] Bot protection: Cloudflare Turnstile on sign-up, sign-in and password reset; CAPTCHA protection on in Supabase.
- [ ] Billing: finish the **Billing (Stripe)** steps in a sandbox, test with `4242 4242 4242 4242`, then switch to live keys.
- [ ] Sign up, confirm on a phone, sync a photo, and delete a test account on the live site.
- [x] Put a real contact email in `privacy.html` and `terms.html`.
- [ ] Check plan limits: the free Supabase plan has 500 MB of database (photos count) and pauses after a week without activity.
- [ ] Deploy from `main` (and optionally a custom domain; then update `og:url`/`og:image` in `index.html` and the Supabase URLs).

## Brand

The Ledgery logo is an "L" whose foot rises into an arrow: a ledger that grows. Files are in [`brand/`](brand/):

| File | Use it for |
|---|---|
| `ledgery-logo.svg` / `.png` | Full logo on light backgrounds |
| `ledgery-logo-white.svg` / `.png` | Full logo on dark backgrounds |
| `ledgery-mark.svg` | The icon alone, any size |
| `ledgery-icon-1024.png`, `-512`, `-180`, `-32` | App icons, home-screen icon, favicon |
| `ledgery-avatar.png` | Square profile picture (Depop, Instagram, etc.) |

The lettering is Inter Tight SemiBold, converted to shapes so it looks the same everywhere. Brand green runs from `#5CC495` to `#1F6F54`.

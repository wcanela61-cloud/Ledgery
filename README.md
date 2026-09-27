# Ledgery — Reseller Dashboard

A single-file web app for resellers: track what you buy, what you sell, and what you actually make.

## Usage

Open `index.html` in a browser — no build step or server required. The app starts empty.

- **Inventory** — add items with product details (name; Men's, Women's or Kids, then a category, then a size from a list that fits it — letter sizes, waist or numeric sizes, kids/toddler/baby sizes, shoe sizes for footwear, or your own; brand, color, condition), the purchase (an automatic order number like `ORD-260927-1432-K7QX`, date and time purchased, total spent ÷ quantity = cost per item). Buying several of the same thing makes one **batch**: a single row that opens to show each unit, edited all at once with **Edit batch** (including changing the quantity), while each unit can still sell on its own, listing status, listing price, photos and notes. Or add a bundle: one price split evenly across several different items. Switch between a table and a photo grid; items without photos get an icon for their category.
- **Sales** — record a sale, creating the item on the spot if it isn't in inventory yet. Platform fees are pre-filled from each platform's rate (editable in Settings).
- **Ledger** — a pencil you can chat with about your business ("How much did I make this month?", "What's been sitting unsold the longest?"). Inside the Claude preview it answers with Claude, using a summary of your inventory and sales (the first question asks your permission, and answers use your own Claude usage). Opened anywhere else, it answers common questions itself from your numbers. Claude answers are limited to 5 a day (**Analyze my business**, a full report, uses 2); after that, and whenever Claude isn't available, Ledger uses its built-in answers, which are unlimited.
- **Dashboard** — this month / this year / all time, with trends vs. last period, a monthly profit goal ring (set it in Settings) and your top 3 sellers.
- **Analytics** — monthly revenue and net profit, sell-through, days to sell, and per-platform and per-category results.

## Your data

Everything is saved in the browser (items and sales in `localStorage`, photos in IndexedDB), so it stays when you reload but lives only in that browser. Use **Settings → Data & backup** to download a backup file (and restore it on another device), or export CSV files for spreadsheets. **Erase all data** clears everything; deletes and erases can be undone for a few seconds.

## Accounts (optional)

Out of the box, data is saved only in the browser. To let people **create an account, sign in, and sync across devices**, connect a free [Supabase](https://supabase.com) project:

1. **Create a project** at supabase.com (free plan is fine). Pick any name and a strong database password.
2. **Create the table:** open **SQL Editor → New query**, paste everything from [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This also turns on row-level security, so each person can only ever read their own data.
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
- Your name greets you on the dashboard and your shop name shows in the sidebar. Change them in **Settings → Account → Edit profile**.
- Items, sales, platform fee rates and the monthly goal sync automatically a moment after each change, and pull down when you come back to the tab.
- If a browser and the account both have different data (e.g. first sign-in on a computer you'd already been using), Ledgery asks which to keep instead of guessing.
- Two devices can't silently overwrite each other: every save carries a version number, and a stale save stops and re-syncs.
- Signing out removes the data from that browser (it stays in the account), so shared computers stay private.
- Photos stay on the device they were added on (they're too large to sync in this version). Theme, font and Ledger chat history are per device too.

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

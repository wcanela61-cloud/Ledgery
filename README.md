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

## Install as an app

Ledgery is installable (`manifest.webmanifest`, icons in `brand/`) and opens offline (`sw.js`): pages are always fetched fresh when online, so new deploys show up right away, and the last copy is used offline. Account and sync requests are never cached. **Settings → App** shows an **Install app** button where the browser supports it (Chrome, Edge, Android), and "Share → Add to Home Screen" instructions on iPhone. Shared links show a preview card (`brand/og-image.png`).

## Privacy & terms

[`privacy.html`](privacy.html) and [`terms.html`](terms.html) are linked from sign-up, the sign-in page and **Settings → App**. Before launch, replace **"Contact email coming soon"** in both files with a real contact address. They are a plain-language starting point, not legal advice; have them reviewed if you charge money or have many users.

## Launch checklist

- [ ] Run `supabase/photos.sql` and `supabase/delete-account.sql` (or all of `schema.sql` on a new project).
- [ ] **Authentication → URL Configuration:** Site URL and Redirect URLs set to the live address.
- [ ] **Authentication → SMTP:** connect your own email sender (Resend, Postmark, SendGrid…). The built-in one only sends a few emails an hour. Then brand the email templates.
- [ ] Bot protection: Supabase's CAPTCHA (**Authentication → Attack Protection**) also needs the widget added to the sign-up form. Don't switch it on until that's in, or sign-ups will fail.
- [ ] Sign up, confirm on a phone, sync a photo, and delete a test account on the live site.
- [ ] Put a real contact email in `privacy.html` and `terms.html`.
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

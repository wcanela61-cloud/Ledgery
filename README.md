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

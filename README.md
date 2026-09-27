# Ledgery — Reseller Dashboard

A single-file web app for resellers: track what you buy, what you sell, and what you actually make.

## Usage

Open `index.html` in a browser — no build step or server required. The app starts empty.

- **Inventory** — add items one at a time, or a bundle (one price split evenly across several items).
- **Sales** — record a sale, creating the item on the spot if it isn't in inventory yet. Platform fees are pre-filled from each platform's rate (editable in Settings).
- **Smart Entry** — type a sale in plain words ("Sold Levi jeans on eBay for $40, bought for $8"). It's a basic text reader, not AI, so check the fields before saving.
- **Dashboard** — this month / this year / all time.
- **Analytics** — monthly revenue and net profit, sell-through, days to sell, and per-platform and per-category results.

## Your data

Everything is saved in the browser's `localStorage`, so it stays when you reload but lives only in that browser. Use **Settings → Data & backup** to download a backup file (and restore it on another device), or export CSV files for spreadsheets. **Erase all data** clears everything; deletes and erases can be undone for a few seconds.

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

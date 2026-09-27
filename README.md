# Ledgerly — Reseller Dashboard

A single-file web app for resellers: track what you buy, what you sell, your business expenses, and what you actually make.

## Usage

Open `index.html` in a browser — no build step or server required. The app starts empty.

- **Inventory** — add items one at a time, or a bundle (one price split evenly across several items).
- **Sales** — record a sale, creating the item on the spot if it isn't in inventory yet. Platform fees are pre-filled from each platform's rate (editable in Settings).
- **Expenses** — business costs like packaging and shipping supplies; subtracted from profit.
- **Smart Entry** — type a sale in plain words ("Sold Levi jeans on eBay for $40, bought for $8"). It's a basic text reader, not AI, so check the fields before saving.
- **Dashboard** — this month / this year / all time, with profit after expenses.
- **Analytics** — monthly revenue and net profit, sell-through, days to sell, and per-platform and per-category results.

## Your data

Everything is saved in the browser's `localStorage`, so it stays when you reload but lives only in that browser. Use **Settings → Data & backup** to download a backup file (and restore it on another device), or export CSV files for spreadsheets. **Erase all data** clears everything; deletes and erases can be undone for a few seconds.

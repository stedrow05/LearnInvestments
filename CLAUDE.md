# LearnInvestments

Beginner-friendly investment portfolio simulator where users buy shares of real companies (Apple, Tesla, Coca-Cola, etc.), allocate to bonds/ETFs/savings, and simulate performance. Single-page web app — no build step, no frameworks.

## Quick Start

Open `index.html` in a browser. For local dev, use a simple HTTP server:
```bash
python -m http.server 8000
```

## Tech Stack

- Vanilla HTML/CSS/JavaScript (ES5 compatible)
- Chart.js v4 via CDN (only external dependency)
- No npm, no build tools, no frameworks

## Architecture

**Module pattern (IIFE)** — each JS file attaches to `window`:
- `window.AppData` — 12 stocks (real companies), 3 other investments, market events, glossary, quiz, tips
- `window.App` — tab navigation, utilities, state management, `getTotalSpent()`, `getStockByTicker()`
- `window.Portfolio` — stock marketplace (buy/sell shares), other investment sliders, advice engine, detail modal, **live price fetching** (self-initializing on load)
- `window.Simulation` — Monte Carlo engine (100 runs, seeded LCG PRNG, Box-Muller) with sector-based market events
- `window.ChartManager` — Chart.js wrapper (doughnut + line charts)
- `window.Quiz` — risk tolerance quiz → suggested portfolio with specific stocks + dollar amounts
- `window.Education` — company accordions, other investment accordions, glossary, tips

**Script load order matters** (synchronous, in index.html): data → app → portfolio → simulation → chart → quiz → education.

**Cross-module calls:**
- Quiz → Portfolio: `Portfolio.setHoldings({ stocks: { AAPL: 5, ... }, bonds: 2000, ... })`
- Portfolio → ChartManager: `ChartManager.updateAllocationPie(allocMap)`
- Simulation → ChartManager: `ChartManager.renderGrowthChart(...)`
- All modules use `App.getStockByTicker(ticker)` to look up stock data
- `Portfolio.refreshAllPrices()` is called internally on init — no external caller triggers it

## Live Price Fetching

`portfolio.js` fetches live prices for all 12 preset stocks on page load via `refreshAllPrices()` → `fetchLivePrice(ticker, callback)`.

**Waterfall (first success wins, 8s timeout per attempt):**
1. Yahoo Finance chart JSON API via `allorigins.win` proxy
2. Yahoo Finance chart JSON API via `corsproxy.io` proxy
3. Yahoo Finance page HTML via `allorigins.win` (scrapes embedded `regularMarketPrice` JSON blob)
4. Stooq CSV via `allorigins.win` proxy
5. Stooq CSV direct request

**Price destination:** fetched prices overwrite `stock.price` directly on the `AppData` stock objects in memory — they are **not** stored in `App.state`. After update, `renderStockGrid()` and `updateSummary()` are called to reflect the new prices.

**`file://` origin:** CORS proxies reject requests from `file://`. If the app is opened directly (not via HTTP server), `refreshAllPrices()` bails immediately and sets the status banner to "Sample prices shown — serve via HTTP for live prices". This is why the Quick Start requires an HTTP server.

**Status banner:** `#price-status` element shows one of: "Updating live prices…", "Live prices — updated HH:MM", "Sample prices shown…", or "Could not fetch live prices — showing sample prices".

## State

Central state in `App.state`:
- `stockHoldings: { AAPL: 3, MSFT: 1, ... }` — share counts per ticker
- `otherHoldings: { bonds: 0, etfs: 0, savings: 0 }` — dollar amounts
- `currentTab` — active tab name
- Budget: `AppData.BUDGET` = $10,000

## Stocks (12 companies)

AAPL ($175), MSFT ($420), GOOGL ($175), AMZN ($185), TSLA ($175), JNJ ($155), JPM ($200), KO ($60), NFLX ($625), DIS ($110), NKE ($95), MCD ($280)

These are **static fallback prices** defined in `AppData`. At runtime, live prices overwrite them (see Live Price Fetching above).

Each stock has: ticker, name, price, sector, sectorColor, riskLevel (1-5), typicalReturn, dividend yield, description, whyBuy[], risks[], guidance text.

Sectors: Technology, Healthcare, Finance, Consumer Goods, Entertainment, Automotive / Energy

## Market Events

Events have `sectorImpacts` (per-sector modifiers for stocks) and `otherImpacts` (for bonds/etfs/savings). This allows different sectors to react differently to the same event.

## Conventions

- **IDs/classes:** kebab-case (`#stock-grid`, `.stock-card`)
- **JS functions:** camelCase
- **CSS variables:** `--color-*`, `--font-size-*`, `--radius-*`, `--shadow-*`
- **Icons:** Unicode emoji (no icon fonts)
- **No test framework** — manual browser testing

## Key Algorithms

- **Diversification:** Shannon entropy at sector level (stocks grouped by sector + other investment types)
- **Simulation:** Seeded LCG PRNG → Box-Muller normal distribution → per-holding returns + sector-specific market event modifiers → 100 runs → percentile bands (p10/p50/p90)
- **Advice:** Rule-based checks on sector concentration, single-stock concentration, dividend coverage, risk level, stock-vs-safe ratio
- **Live price fetching:** 5-attempt waterfall (Yahoo JSON → Yahoo HTML scrape → Stooq CSV), each routed through CORS proxies with 8s timeout per attempt; prices applied directly to `AppData` stock objects

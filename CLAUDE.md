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
- `window.Portfolio` — stock marketplace (buy/sell shares), other investment sliders, advice engine, detail modal
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

## State

Central state in `App.state`:
- `stockHoldings: { AAPL: 3, MSFT: 1, ... }` — share counts per ticker
- `otherHoldings: { bonds: 0, etfs: 0, savings: 0 }` — dollar amounts
- `currentTab` — active tab name
- Budget: `AppData.BUDGET` = $10,000

## Stocks (12 companies)

AAPL ($175), MSFT ($420), GOOGL ($175), AMZN ($185), TSLA ($175), JNJ ($155), JPM ($200), KO ($60), NFLX ($625), DIS ($110), NKE ($95), MCD ($280)

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

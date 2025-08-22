# Project Requirement — Clickable CTRM + AI Dashboard Prototype

> **Goal:** Build a **clickable walkthrough** web prototype (no build tools) from the attached dashboard mockup image. The prototype should mirror layout and interactions and run by simply opening `index.html`.

This document is intended to be pasted into **Claude Code** (with the mockup image attached) so the agent can generate a runnable project in one go.

---

## 1) Deliverables (file tree)

Produce these files exactly:

```
index.html
styles.css
js/data.js
js/charts.js
js/ui.js
js/tour.js
js/app.js
```

- The project **must run offline** by opening `index.html` (CDN links are OK).
- Keep code modular: put responsibilities into the respective JS files (details in §4).
- Use semantic HTML and accessible attributes (ARIA where helpful).

---

## 2) Tech Stack

- Plain **HTML/CSS/JS** (no frameworks/build steps).
- **Chart.js** (CDN) for sparklines + market chart.
- **Leaflet + OSM** (CDN) for vessel map.
- No external state managers; use simple modules and event listeners.

---

## 3) UI & Interactions (match the mockup)

Top navigation (non-routing, active styling only): **Book, Market, Logistics, AI Insights, Reports**.

**Left filter rail** with 4 selects:
- **Commodity**, **Location**, **Counterparty**, **Date** (YYYY-MM-DD)

**Main area** (cards laid out like the mockup):
1. **Metric**: four KPI sparklines with titles (e.g., “WTI Δ”, “Brent Δ”, “Basis HOU-RTM”, “Hedge Ratio”). Clicking a KPI applies a global filter.
2. **Trade Capture**: table with columns: Date, Commodity, Venue, Side, Qty (bbl), Price, Counterparty, Status. Row click opens a **right-side drawer** with details and an **“Invoice / Settlement”** button (fires a toast).
3. **Market Prices**: multi-series line chart (WTI/Brent). Include a toggle **“Forecast overlay”** that adds q10/q50/q90 bands using dummy LSTM/TFT data.
4. **Risk Metrics**: 5×7 heatmap (VaR or limit utilisation) with a visible color legend.
5. **AI Recommendations**: list of 3 items; each shows title, bullet rationale, simulated P&L delta, confidence. An **“Apply as Hedge”** button writes a new dummy trade into Trade Capture and shows a toast.
6. **Vessel Tracking**: Leaflet map centered on Europe↔US Gulf with a demo route (Rotterdam → Houston) and 3 port pins.

**Flow arrows** (slim SVG with labels):
- Metric → Trade Capture
- Metric → Market Prices
- Market Prices → AI Recommendations
- Trade Capture ↔ Market Prices (two-way; labels “Forecast Data” and “Invoice / Settlement”)

**Guided Tour**: a 6-step overlay (dependency-free) the user can launch from a “Start Tour” button:
1) Filters rail, 2) Metric, 3) Market Prices + Forecast toggle, 4) AI Recommendations (click Apply), 5) Trade Capture (see new row), 6) Risk & Vessel.

---

## 4) Responsibilities per JavaScript file

- `js/data.js` — Define and export **dummy datasets** and helper generators:
  - `commodities`, `locations`, `counterparties`
  - `marketPrices` (365 days for WTI/Brent; drift + seasonality + noise)
  - `forecast` (30-day q10/q50/q90 band)
  - `trades` (8–10 rows)
  - `riskGrid` (5×7 values 0–1)
  - `recs` (3 recommendations with rationale, pnl, confidence)
  - `vessels` (`ports[]`, `route[]`)
  - Provide deterministic RNG (`seededRandom`) for stable charts.

- `js/charts.js` — Chart rendering utilities (Chart.js + Leaflet):
  - `initKpis(ctxArray, data)`, `updateKpis(filters)`
  - `initMarketChart(ctx, series, forecast)`, `toggleForecast(show)`
  - `initMap(elemId, vessels)`

- `js/ui.js` — DOM rendering & interactions:
  - Render filters, table, drawer, recommendations, heatmap, toasts.
  - Functions: `renderTrades(filters)`, `renderRecs(filters)`, `renderHeatmap(grid)`, `openDrawer(trade)`, `showToast(msg)`.

- `js/tour.js` — Minimal guided-tour overlay:
  - `startTour(steps)`, `stopTour()`, keyboard handling (ESC), focus trap.

- `js/app.js` — Entry point:
  - Wire events, call initial renders, central `applyFilters()`; orchestrate arrows.

All modules should be **imported with `<script type="module">`** in `index.html`.

---

## 5) Dummy Data Spec

Embed realistic, hard-coded data *or* generate at runtime:

```js
commodities    = ["WTI","Brent","GasOil"];
locations      = ["Houston","Rotterdam","Cushing","Fujairah"];
counterparties = ["Acme Air","Blue Refining","Delta Trading","Omega Marine"];

// Prices: 365 daily points in $70–$90 (drift + sin + noise)
// Forecast: 30 future days with q10<q50<q90
// Trades: sample rows across venues ICE/NYMEX; sides Buy/Sell
// Risk: numbers 0..1 mapped to a green→amber→red scale
// Recs: 3 items mirroring earlier conversation (sell WTI Sep, buy Brent Oct, reduce WTI Oct)
```

Use consistent dates (ISO strings), and ensure the filters actually affect tables and charts.

---

## 6) Acceptance Criteria (must pass)

- Open `index.html` locally → everything renders; no console errors.
- Filters, KPI clicks, and **Reset** pill work and update all widgets.
- Market chart’s **Forecast overlay** toggles three translucent quantile bands.
- Clicking **Apply as Hedge** appends a new trade row (status “Proposed”) and shows a toast.
- Trade row click opens a **drawer** with all fields and an **Invoice / Settlement** button (toast).
- Risk heatmap displays with legend and cell tooltips.
- Leaflet map shows pins and a polyline route.
- A 6-step **Guided Tour** works (Next/Back/ESC).
- Code is modular, commented, and accessible (labels, focus states).

---

## 7) Visual Style

- Neutral theme, soft shadows, rounded 12px–16px corners, responsive 12‑column grid.
- Loading shimmers for charts for ~500ms.
- Typography scale: 14/16/20/24px; monospace for numeric badges.

---

## 8) Notes for the Agent

- Use the **attached mockup image as layout reference**.
- Keep JS modules independent and avoid global leakage.
- Include short README comments at the top of `index.html` describing how to run and where to tweak data.
- Do **not** use any build tool; no React/Vue; no external tour library.

**Output all files with full contents. Do not summarize.**
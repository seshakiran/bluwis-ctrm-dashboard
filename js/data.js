/*
 * data.js — Dummy datasets and generators for the CTRM + AI dashboard prototype.
 * Replace or augment with real feeds later.
 */

export const commodities = ["WTI","Brent","GasOil"];
export const locations = ["Houston","Rotterdam","Cushing","Fujairah"];
export const counterparties = ["Acme Air","Blue Refining","Delta Trading","Omega Marine"];

// Deterministic RNG for stable demo visuals
export function seededRandom(seed=42) {
  let t = seed >>> 0;
  return () => (t = (t * 1664525 + 1013904223) >>> 0) / 2**32;
}

const rand = seededRandom(123);

// Generate price series with reduced data points for performance
function genSeries(base=80, amp=5, drift=0.02, days=90) { // Reduced from 365 to 90 days
  const out = [];
  let v = base;
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  for (let i=0; i<days; i++) {
    const d = new Date(start); 
    d.setDate(start.getDate() + i);
    
    // More controlled price movement
    const seasonality = (amp * Math.sin(i/25)) * 0.02;
    const noise = (rand() - 0.5) * 0.3; // Reduced noise
    v += drift + seasonality + noise;
    
    // Keep prices in reasonable range
    v = Math.max(v, base * 0.7);
    v = Math.min(v, base * 1.3);
    
    out.push({ 
      date: d.toISOString().slice(0,10), 
      price: Math.round(v * 100) / 100 
    });
  }
  return out;
}

export const marketPrices = {
  WTI: genSeries(78),
  Brent: genSeries(82)
};

// Forecast bands for next few days (reduced for performance)
export function genForecast(last, days=15) { // Reduced from 30 to 15 days
  const out = [];
  let v = last;
  
  for (let i=1; i<=days; i++) {
    // More controlled forecast movement
    v += 0.02 + (rand() - 0.5) * 0.2; // Reduced volatility
    const q50 = v;
    
    out.push({
      date: new Date(Date.now() + 86400000*i).toISOString().slice(0,10),
      q10: Math.round((q50 - 0.8) * 100) / 100,
      q50: Math.round(q50 * 100) / 100,
      q90: Math.round((q50 + 0.8) * 100) / 100
    });
  }
  return out;
}
export const forecast = genForecast(marketPrices.WTI[marketPrices.WTI.length-1].price);

// Sample trades
export const trades = [
  {id: 1, date:"2025-07-08", commodity:"WTI",  venue:"NYMEX", side:"Sell", qty:50000, price:82.1, cpty:"Delta Trading", status:"Captured"},
  {id: 2, date:"2025-07-07", commodity:"Brent",venue:"ICE",   side:"Buy",  qty:30000, price:85.7, cpty:"Blue Refining", status:"Settled"},
  {id: 3, date:"2025-07-05", commodity:"WTI",  venue:"NYMEX", side:"Buy",  qty:20000, price:79.9, cpty:"Acme Air",      status:"Invoiced"},
  {id: 4, date:"2025-07-03", commodity:"GasOil",venue:"ICE",  side:"Sell", qty:15000, price:92.3, cpty:"Omega Marine",  status:"Captured"}
];

// 5x7 risk grid values in 0..1
export const riskGrid = Array.from({length:5}, ()=>Array.from({length:7}, ()=> Math.round(rand()*100)/100));

// AI recommendations
export const recs = [
  { id: 1, title:"Sell 50k bbl WTI Sep @ ≥ $82",
    rationale:["q50 > trigger for 4/5 days","Basis HOU-RTM widening","Delta exposure > policy band"],
    pnl:"+$420k vs baseline", confidence:0.78, action:"sell", instrument:"WTI Sep" },
  { id: 2, title:"Buy 10k bbl Brent Oct to cover deficit",
    rationale:["Inventory draw risk","FX tailwind"],
    pnl:"+$75k", confidence:0.66, action:"buy", instrument:"Brent Oct" },
  { id: 3, title:"Reduce Oct WTI hedge by 10k",
    rationale:["MtM stress > threshold","Calendar spread flattening"],
    pnl:"+$30k", confidence:0.61, action:"reduce", instrument:"WTI Oct" }
];

// Vessel demo data
export const vessels = {
  ports: [
    {name:"Rotterdam", lat:51.94, lon:4.14},
    {name:"Houston",   lat:29.73, lon:-95.26},
    {name:"Cushing",   lat:35.99, lon:-96.77}
  ],
  route: [
    [51.94,4.14],[46.0,-15.0],[36.0,-40.0],[29.73,-95.26]
  ]
};

// Current filter state
export let currentFilters = {
  commodity: '',
  location: '',
  counterparty: '',
  date: ''
};

// Filter update function
export function updateFilters(newFilters) {
  currentFilters = { ...currentFilters, ...newFilters };
}

// Filter trades based on current filters
export function getFilteredTrades() {
  return trades.filter(trade => {
    if (currentFilters.commodity && trade.commodity !== currentFilters.commodity) return false;
    if (currentFilters.counterparty && trade.cpty !== currentFilters.counterparty) return false;
    if (currentFilters.date && trade.date !== currentFilters.date) return false;
    return true;
  });
}
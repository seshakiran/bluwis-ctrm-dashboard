/*
 * data.js — Dummy datasets and generators for the CTRM + AI dashboard prototype.
 * Replace or augment with real feeds later.
 */

export const commodities = ["WTI","Brent","RBOB","Natural Gas","Heating Oil","Diesel"];
export const locations = ["Houston","Rotterdam","Cushing","Singapore","New York","London"];
export const counterparties = ["Shell Trading","BP Oil","ExxonMobil","Vitol","Trafigura","Glencore","Koch Supply","Marathon Petroleum"];

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
  WTI: genSeries(78.45),
  Brent: genSeries(82.90),
  RBOB: genSeries(2.45),
  "Natural Gas": genSeries(3.20),
  "Heating Oil": genSeries(2.85),
  Diesel: genSeries(2.95)
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

// Sample trades with realistic data
export const trades = [
  {id: 1, date:"2025-08-22", commodity:"WTI", venue:"NYMEX", side:"Sell", qty:100000, price:78.45, cpty:"Shell Trading", status:"Captured"},
  {id: 2, date:"2025-08-22", commodity:"Brent", venue:"ICE", side:"Buy", qty:75000, price:82.90, cpty:"BP Oil", status:"Settled"},
  {id: 3, date:"2025-08-21", commodity:"RBOB", venue:"NYMEX", side:"Sell", qty:42000, price:2.45, cpty:"ExxonMobil", status:"Invoiced"},
  {id: 4, date:"2025-08-21", commodity:"Natural Gas", venue:"NYMEX", side:"Buy", qty:250000, price:3.20, cpty:"Vitol", status:"Captured"},
  {id: 5, date:"2025-08-20", commodity:"Heating Oil", venue:"NYMEX", side:"Sell", qty:35000, price:2.85, cpty:"Trafigura", status:"Settled"},
  {id: 6, date:"2025-08-20", commodity:"WTI", venue:"NYMEX", side:"Buy", qty:150000, price:77.90, cpty:"Glencore", status:"Invoiced"},
  {id: 7, date:"2025-08-19", commodity:"Brent", venue:"ICE", side:"Sell", qty:80000, price:83.15, cpty:"Koch Supply", status:"Captured"},
  {id: 8, date:"2025-08-19", commodity:"Diesel", venue:"ICE", side:"Buy", qty:60000, price:2.95, cpty:"Marathon Petroleum", status:"Settled"},
  {id: 9, date:"2025-08-18", commodity:"WTI", venue:"NYMEX", side:"Buy", qty:200000, price:76.80, cpty:"Shell Trading", status:"Invoiced"},
  {id: 10, date:"2025-08-18", commodity:"RBOB", venue:"NYMEX", side:"Sell", qty:55000, price:2.48, cpty:"BP Oil", status:"Captured"}
];

// 5x7 risk grid values in 0..1
export const riskGrid = Array.from({length:5}, ()=>Array.from({length:7}, ()=> Math.round(rand()*100)/100));

// AI recommendations with realistic trading insights
export const recs = [
  { id: 1, title:"Sell 100k bbl WTI Sep @ ≥ $78.50",
    rationale:["Crude inventories building above 5-year avg","Refinery maintenance season approaching","Technical resistance at $79.00 level","COT data shows speculative long liquidation"],
    pnl:"+$850k vs baseline", confidence:0.82, action:"sell", instrument:"WTI Sep" },
  { id: 2, title:"Buy 75k bbl Brent Oct to hedge Asian exposure",
    rationale:["Geopolitical tensions in Middle East escalating","China demand recovery signals strengthening","Brent-WTI spread widening to $4.50","OPEC+ production cuts compliance rising"],
    pnl:"+$420k", confidence:0.74, action:"buy", instrument:"Brent Oct" },
  { id: 3, title:"Long RBOB gasoline crack spread vs WTI",
    rationale:["Driving season demand peak continuing","Refinery utilization rates at 92%","Crack spreads below historical average","Weather forecasts support continued demand"],
    pnl:"+$285k", confidence:0.69, action:"buy", instrument:"RBOB Crack" },
  { id: 4, title:"Natural Gas calendar spread - Buy Winter/Sell Summer",
    rationale:["Storage levels 15% below 5-year average","La Niña weather pattern developing","Industrial demand recovering post-maintenance","LNG export capacity expanding"],
    pnl:"+$195k", confidence:0.71, action:"spread", instrument:"NG Cal Spread" }
];

// Vessel demo data with major trading hubs
export const vessels = {
  ports: [
    {name:"Rotterdam (ARA)", lat:51.94, lon:4.14, cargo:"2.1M bbl Brent", status:"Loading"},
    {name:"Houston Ship Channel", lat:29.73, lon:-95.26, cargo:"1.8M bbl WTI", status:"Discharging"},
    {name:"Singapore", lat:1.35, lon:103.82, cargo:"3.2M bbl Mixed", status:"In Transit"},
    {name:"Fujairah", lat:25.12, lon:56.32, cargo:"2.8M bbl Crude", status:"Waiting"},
    {name:"Cushing, OK", lat:35.99, lon:-96.77, cargo:"Storage Hub", status:"Active"}
  ],
  route: [
    [51.94,4.14], // Rotterdam
    [49.0,0.0],   // English Channel
    [40.0,-20.0], // Mid Atlantic
    [25.0,-50.0], // Caribbean
    [29.73,-95.26] // Houston
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
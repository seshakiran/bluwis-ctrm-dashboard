/*
 * charts.js — Chart.js and Leaflet helpers
 */
import { marketPrices, forecast, vessels } from './data.js';

export const charts = {
  kpis: [],
  market: null,
  map: null
};

export function initKpis(canvasIds) {
  canvasIds.forEach((id, idx) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const key = idx % 2 === 0 ? 'WTI' : 'Brent';
    const data = marketPrices[key].slice(-60).map(d => d.price);
    
    // Add loading shimmer
    setTimeout(() => {
      const chart = new window.Chart(ctx, {
        type: 'line',
        data: { 
          labels: data.map((_v,i)=>i),
          datasets: [{ 
            data, 
            fill: false, 
            pointRadius: 0, 
            tension: 0.3,
            borderColor: idx % 2 === 0 ? '#2563eb' : '#059669',
            borderWidth: 2
          }] 
        },
        options: { 
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }, 
          scales: { 
            x: { display: false },
            y: { display: false }
          },
          elements: {
            line: {
              tension: 0.3
            }
          }
        }
      });
      charts.kpis.push(chart);
    }, 500 + idx * 100);
  });
}

export function initMarketChart(canvasId, seriesKey='WTI') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const wtiSeries = marketPrices.WTI.slice(-90);
  const brentSeries = marketPrices.Brent.slice(-90);
  
  setTimeout(() => {
    charts.market = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: wtiSeries.map(d=>d.date),
        datasets: [
          { 
            label: 'WTI', 
            data: wtiSeries.map(d=>d.price), 
            fill: false, 
            pointRadius: 0, 
            tension: 0.25,
            borderColor: '#2563eb',
            borderWidth: 2
          },
          { 
            label: 'Brent', 
            data: brentSeries.map(d=>d.price), 
            fill: false, 
            pointRadius: 0, 
            tension: 0.25,
            borderColor: '#059669',
            borderWidth: 2
          }
        ]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
          x: { 
            display: true,
            type: 'category',
            ticks: {
              maxTicksLimit: 10
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Price ($)'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }, 600);
}

export function toggleForecast(show) {
  if (!charts.market) return;
  
  // Remove existing forecast bands
  charts.market.data.datasets = charts.market.data.datasets.filter(ds=>!ds._isForecast);
  
  if (show) {
    const f = forecast;
    const extendedLabels = [...charts.market.data.labels, ...f.map(d=>d.date)];
    
    // Extend main datasets with null values for forecast period
    charts.market.data.datasets.forEach(ds => {
      const nullExtension = new Array(f.length).fill(null);
      ds.data = [...ds.data.slice(0, charts.market.data.labels.length), ...nullExtension];
    });
    
    // Add forecast bands
    charts.market.data.datasets.push(
      { 
        label: 'Forecast Q10', 
        data: [...new Array(charts.market.data.labels.length).fill(null), ...f.map(d=>d.q10)], 
        borderDash: [4,2], 
        pointRadius: 0, 
        tension: 0.2, 
        borderColor: 'rgba(37, 99, 235, 0.3)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: '+2',
        _isForecast: true 
      },
      { 
        label: 'Forecast Q50', 
        data: [...new Array(charts.market.data.labels.length).fill(null), ...f.map(d=>d.q50)], 
        pointRadius: 0, 
        tension: 0.2, 
        borderColor: 'rgba(37, 99, 235, 0.6)',
        borderWidth: 1,
        _isForecast: true 
      },
      { 
        label: 'Forecast Q90', 
        data: [...new Array(charts.market.data.labels.length).fill(null), ...f.map(d=>d.q90)], 
        borderDash: [4,2], 
        pointRadius: 0, 
        tension: 0.2, 
        borderColor: 'rgba(37, 99, 235, 0.3)',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: '-1',
        _isForecast: true 
      }
    );
    
    charts.market.data.labels = extendedLabels;
  }
  
  charts.market.update('none');
}

export function initMap(elemId='vesselMap') {
  const mapElement = document.getElementById(elemId);
  if (!mapElement || !window.L) return;
  
  setTimeout(() => {
    charts.map = window.L.map(elemId).setView([40,-20], 3);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>'
    }).addTo(charts.map);

    // Add port markers
    vessels.ports.forEach(p => {
      const marker = window.L.marker([p.lat, p.lon]).addTo(charts.map);
      marker.bindPopup(`<strong>${p.name}</strong><br/>Port facility`);
    });
    
    // Add route polyline
    const routeLine = window.L.polyline(vessels.route, {
      weight: 3,
      color: '#2563eb',
      opacity: 0.7
    }).addTo(charts.map);
    
    // Add route labels
    const midPoint = vessels.route[Math.floor(vessels.route.length/2)];
    window.L.marker(midPoint, {
      icon: window.L.divIcon({
        className: 'route-label',
        html: '<div style="background: rgba(37,99,235,0.9); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;">Rotterdam → Houston</div>',
        iconSize: [120, 20],
        iconAnchor: [60, 10]
      })
    }).addTo(charts.map);
    
    // Fit bounds to show all markers
    const group = new window.L.featureGroup([routeLine, ...vessels.ports.map(p => window.L.marker([p.lat, p.lon]))]);
    charts.map.fitBounds(group.getBounds().pad(0.1));
  }, 800);
}

export function updateKpis(filters) {
  // In a real app, you'd update KPI data based on filters
  // For now, just update the visual indicators
  charts.kpis.forEach((chart, idx) => {
    if (chart && chart.data && chart.data.datasets[0]) {
      chart.update('none');
    }
  });
}
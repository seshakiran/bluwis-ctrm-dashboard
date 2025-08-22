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
    if (!canvas) {
      console.warn(`KPI canvas ${id} not found`);
      return;
    }
    
    // Set explicit canvas dimensions to prevent resize issues
    canvas.width = 120;
    canvas.height = 40;
    canvas.style.width = '120px';
    canvas.style.height = '40px';
    
    try {
      const ctx = canvas.getContext('2d');
      const key = idx % 2 === 0 ? 'WTI' : 'Brent';
      const priceData = marketPrices[key];
      
      if (!priceData || priceData.length === 0) {
        console.error(`No price data found for ${key}`);
        return;
      }
      
      const data = priceData.slice(-30).map(d => d.price); // Reduced data points
      
      // Create chart immediately without setTimeout to avoid timing issues
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
            borderWidth: 1.5
          }] 
        },
        options: { 
          responsive: false, // Disable responsive to prevent resize loops
          maintainAspectRatio: true,
          animation: false, // Disable animations for performance
          plugins: { 
            legend: { display: false },
            tooltip: { enabled: false }
          }, 
          scales: { 
            x: { display: false },
            y: { display: false }
          },
          elements: {
            line: { tension: 0.3 },
            point: { radius: 0 }
          }
        }
      });
      
      charts.kpis.push(chart);
      console.log(`✅ KPI chart ${id} initialized successfully`);
      
    } catch (error) {
      console.error(`Error initializing KPI chart ${id}:`, error);
    }
  });
}

export function initMarketChart(canvasId, seriesKey='WTI') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.warn(`Market chart canvas ${canvasId} not found`);
    return;
  }
  
  try {
    const ctx = canvas.getContext('2d');
    const wtiSeries = marketPrices.WTI.slice(-60); // Reduced data points
    const brentSeries = marketPrices.Brent.slice(-60);
    
    if (!wtiSeries.length || !brentSeries.length) {
      console.error('No market price data available');
      return;
    }
    
    // Create chart immediately without setTimeout
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
        animation: {
          duration: 0 // Disable animations for performance
        },
        scales: {
          x: { 
            display: true,
            type: 'category',
            ticks: {
              maxTicksLimit: 8,
              maxRotation: 0
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Price ($)'
            },
            ticks: {
              maxTicksLimit: 6
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
    
    console.log('✅ Market chart initialized successfully');
    
  } catch (error) {
    console.error('Error initializing market chart:', error);
  }
}

export function toggleForecast(show) {
  if (!charts.market) {
    console.warn('Market chart not initialized for forecast toggle');
    return;
  }
  
  try {
    // Remove existing forecast bands
    charts.market.data.datasets = charts.market.data.datasets.filter(ds=>!ds._isForecast);
    
    if (show) {
      const f = forecast.slice(0, 20); // Limit forecast data points
      const originalLabels = charts.market.data.labels.slice(); // Store original labels
      const originalDatasetLength = originalLabels.length;
      
      // Simplified forecast overlay without extending labels
      charts.market.data.datasets.push(
        { 
          label: 'Forecast', 
          data: [...new Array(originalDatasetLength).fill(null), ...f.map(d=>d.q50)], 
          borderDash: [5,5], 
          pointRadius: 0, 
          tension: 0.2, 
          borderColor: 'rgba(37, 99, 235, 0.7)',
          borderWidth: 2,
          fill: false,
          _isForecast: true 
        }
      );
      
      // Extend labels for forecast
      charts.market.data.labels = [...originalLabels, ...f.map(d=>d.date)];
    }
    
    // Use animation: false for performance
    charts.market.update('none');
    console.log(`✅ Forecast ${show ? 'enabled' : 'disabled'}`);
    
  } catch (error) {
    console.error('Error toggling forecast:', error);
  }
}

export function initMap(elemId='vesselMap') {
  const mapElement = document.getElementById(elemId);
  if (!mapElement) {
    console.warn(`Map element ${elemId} not found`);
    return;
  }
  
  if (!window.L) {
    console.warn('Leaflet library not loaded');
    return;
  }
  
  try {
    // Initialize map immediately without setTimeout
    charts.map = window.L.map(elemId, {
      zoomControl: true,
      attributionControl: true
    }).setView([40,-20], 3);
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 10 // Limit zoom for performance
    }).addTo(charts.map);

    // Add port markers with detailed info
    const markers = [];
    vessels.ports.forEach(p => {
      const marker = window.L.marker([p.lat, p.lon]).addTo(charts.map);
      marker.bindPopup(`
        <div style="min-width: 200px;">
          <strong>${p.name}</strong><br/>
          <strong>Cargo:</strong> ${p.cargo}<br/>
          <strong>Status:</strong> <span style="color: ${p.status === 'Loading' ? '#059669' : p.status === 'Discharging' ? '#d97706' : '#2563eb'}">${p.status}</span>
        </div>
      `);
      markers.push(marker);
    });
    
    // Add route polyline
    const routeLine = window.L.polyline(vessels.route, {
      weight: 3,
      color: '#2563eb',
      opacity: 0.7
    }).addTo(charts.map);
    
    // Fit bounds to show all content
    const group = new window.L.featureGroup([routeLine, ...markers]);
    charts.map.fitBounds(group.getBounds().pad(0.1));
    
    console.log('✅ Vessel map initialized successfully');
    
  } catch (error) {
    console.error('Error initializing map:', error);
  }
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
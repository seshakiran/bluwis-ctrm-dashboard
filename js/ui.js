/*
 * ui.js — DOM rendering & interactions
 */
import { 
  commodities, 
  locations, 
  counterparties, 
  trades, 
  riskGrid, 
  recs, 
  getFilteredTrades, 
  updateFilters, 
  currentFilters 
} from './data.js';
import { updateKpis, toggleForecast } from './charts.js';

// State management
let isDrawerOpen = false;
let currentTradeId = null;

// Initialize filters
export function initFilters() {
  const commoditySelect = document.getElementById('commodityFilter');
  const locationSelect = document.getElementById('locationFilter');
  const counterpartySelect = document.getElementById('counterpartyFilter');
  
  // Populate filter options
  commodities.forEach(commodity => {
    const option = document.createElement('option');
    option.value = commodity;
    option.textContent = commodity;
    commoditySelect.appendChild(option);
  });
  
  locations.forEach(location => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    locationSelect.appendChild(option);
  });
  
  counterparties.forEach(counterparty => {
    const option = document.createElement('option');
    option.value = counterparty;
    option.textContent = counterparty;
    counterpartySelect.appendChild(option);
  });
  
  // Add event listeners
  commoditySelect.addEventListener('change', handleFilterChange);
  locationSelect.addEventListener('change', handleFilterChange);
  counterpartySelect.addEventListener('change', handleFilterChange);
  document.getElementById('dateFilter')?.addEventListener('change', handleFilterChange);
  document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
}

function handleFilterChange() {
  const commodity = document.getElementById('commodityFilter')?.value || '';
  const location = document.getElementById('locationFilter')?.value || '';
  const counterparty = document.getElementById('counterpartyFilter')?.value || '';
  const date = document.getElementById('dateFilter')?.value || '';
  
  updateFilters({ commodity, location, counterparty, date });
  
  // Dispatch custom event
  document.dispatchEvent(new CustomEvent('filters:changed', { 
    detail: currentFilters 
  }));
}

function resetFilters() {
  document.getElementById('commodityFilter').value = '';
  document.getElementById('locationFilter').value = '';
  document.getElementById('counterpartyFilter').value = '';
  document.getElementById('dateFilter').value = '';
  
  updateFilters({ commodity: '', location: '', counterparty: '', date: '' });
  
  document.dispatchEvent(new CustomEvent('filters:changed', { 
    detail: currentFilters 
  }));
}

// Render trades table
export function renderTrades() {
  const tbody = document.getElementById('tradeTableBody');
  if (!tbody) return;
  
  const filteredTrades = getFilteredTrades();
  
  tbody.innerHTML = filteredTrades.map(trade => `
    <tr data-trade-id="${trade.id}" role="button" tabindex="0" aria-label="View trade details for ${trade.commodity} ${trade.side}">
      <td>${trade.date}</td>
      <td>${trade.commodity}</td>
      <td>${trade.venue}</td>
      <td>${trade.side}</td>
      <td>${trade.qty.toLocaleString()}</td>
      <td>$${trade.price}</td>
      <td>${trade.cpty}</td>
      <td><span class="status-badge status-${trade.status.toLowerCase()}">${trade.status}</span></td>
    </tr>
  `).join('');
  
  // Add click handlers
  tbody.querySelectorAll('tr').forEach(row => {
    row.addEventListener('click', () => {
      const tradeId = parseInt(row.dataset.tradeId);
      openDrawer(tradeId);
    });
    
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const tradeId = parseInt(row.dataset.tradeId);
        openDrawer(tradeId);
      }
    });
  });
}

// Render recommendations
export function renderRecs() {
  const container = document.getElementById('recommendationsList');
  if (!container) return;
  
  container.innerHTML = recs.map(rec => `
    <div class="recommendation-item" data-rec-id="${rec.id}">
      <div class="rec-title">${rec.title}</div>
      <div class="rec-rationale">
        <ul>
          ${rec.rationale.map(point => `<li>${point}</li>`).join('')}
        </ul>
      </div>
      <div class="rec-footer">
        <div class="rec-metrics">
          <span class="rec-pnl">${rec.pnl}</span>
          <span class="rec-confidence">Confidence: ${Math.round(rec.confidence * 100)}%</span>
        </div>
        <button class="btn-apply" data-rec-id="${rec.id}" aria-label="Apply ${rec.title} as hedge">
          Apply as Hedge
        </button>
      </div>
    </div>
  `).join('');
  
  // Add click handlers for apply buttons
  container.querySelectorAll('.btn-apply').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const recId = parseInt(btn.dataset.recId);
      applyRecommendation(recId);
    });
  });
}

// Render risk heatmap
export function renderHeatmap() {
  const container = document.getElementById('riskHeatmap');
  if (!container) return;
  
  container.innerHTML = riskGrid.map((row, rowIdx) => 
    row.map((value, colIdx) => {
      const intensity = Math.round(value * 100);
      const color = getRiskColor(value);
      return `
        <div 
          class="risk-cell" 
          style="background-color: ${color}" 
          title="Risk Level: ${intensity}% (Row ${rowIdx + 1}, Col ${colIdx + 1})"
          role="gridcell"
          aria-label="Risk level ${intensity} percent"
        >
          ${intensity}
        </div>
      `;
    }).join('')
  ).join('');
}

function getRiskColor(value) {
  // Green to Red gradient based on risk value
  if (value < 0.33) {
    const g = 150 + Math.round(105 * (0.33 - value) / 0.33);
    return `rgb(5, ${g}, 105)`;
  } else if (value < 0.66) {
    const ratio = (value - 0.33) / 0.33;
    const r = Math.round(217 * ratio);
    const g = Math.round(151 * (1 - ratio));
    return `rgb(${r}, ${151 + g}, 6)`;
  } else {
    const r = 217 + Math.round(3 * (value - 0.66) / 0.34);
    return `rgb(${r}, 38, 38)`;
  }
}

// Wire forecast toggle
export function wireForecastToggle() {
  const toggle = document.getElementById('forecastToggle');
  if (!toggle) return;
  
  toggle.addEventListener('change', (e) => {
    toggleForecast(e.target.checked);
  });
}

// Open trade details drawer
export function openDrawer(tradeId) {
  const trade = trades.find(t => t.id === tradeId);
  if (!trade) return;
  
  currentTradeId = tradeId;
  const drawer = document.getElementById('tradeDrawer');
  const drawerBody = document.getElementById('drawerBody');
  
  if (!drawer || !drawerBody) return;
  
  // Populate drawer content
  drawerBody.innerHTML = `
    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">Trade ID</span>
        <span class="detail-value">#${trade.id}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Date</span>
        <span class="detail-value">${trade.date}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Commodity</span>
        <span class="detail-value">${trade.commodity}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Venue</span>
        <span class="detail-value">${trade.venue}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Side</span>
        <span class="detail-value">${trade.side}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Quantity</span>
        <span class="detail-value">${trade.qty.toLocaleString()} bbl</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Price</span>
        <span class="detail-value">$${trade.price}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Counterparty</span>
        <span class="detail-value">${trade.cpty}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status</span>
        <span class="detail-value">
          <span class="status-badge status-${trade.status.toLowerCase()}">${trade.status}</span>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Notional Value</span>
        <span class="detail-value">$${(trade.qty * trade.price).toLocaleString()}</span>
      </div>
    </div>
  `;
  
  // Show drawer
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  isDrawerOpen = true;
  
  // Focus close button for accessibility
  document.getElementById('closeDrawer')?.focus();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

// Close drawer
export function closeDrawer() {
  const drawer = document.getElementById('tradeDrawer');
  if (!drawer) return;
  
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  isDrawerOpen = false;
  currentTradeId = null;
  
  // Restore body scroll
  document.body.style.overflow = '';
  
  // Return focus to the trade row
  if (currentTradeId) {
    const row = document.querySelector(`[data-trade-id="${currentTradeId}"]`);
    row?.focus();
  }
}

// Show toast notification
export function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;
  
  container.appendChild(toast);
  
  // Add close handler
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn?.addEventListener('click', () => {
    toast.remove();
  });
  
  // Auto-remove after duration
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, duration);
}

// Apply AI recommendation
function applyRecommendation(recId) {
  const rec = recs.find(r => r.id === recId);
  if (!rec) return;
  
  // Create new trade based on recommendation
  const newTrade = {
    id: trades.length + 1,
    date: new Date().toISOString().slice(0, 10),
    commodity: rec.instrument.includes('WTI') ? 'WTI' : 'Brent',
    venue: rec.instrument.includes('WTI') ? 'NYMEX' : 'ICE',
    side: rec.action === 'sell' ? 'Sell' : 'Buy',
    qty: 50000, // Default quantity
    price: 82.0, // Default price
    cpty: 'AI Hedge Co',
    status: 'Proposed'
  };
  
  // Add to trades array
  trades.push(newTrade);
  
  // Re-render trades table
  renderTrades();
  
  // Show success toast
  showToast(`Applied recommendation: ${rec.title}`, 'success');
}

// Handle invoice/settlement button
function handleInvoiceButton() {
  if (!currentTradeId) return;
  
  const trade = trades.find(t => t.id === currentTradeId);
  if (!trade) return;
  
  // Update trade status
  if (trade.status === 'Captured') {
    trade.status = 'Invoiced';
  } else if (trade.status === 'Invoiced') {
    trade.status = 'Settled';
  }
  
  // Re-render trades
  renderTrades();
  
  // Update drawer content
  openDrawer(currentTradeId);
  
  // Show toast
  showToast(`Trade ${trade.status.toLowerCase()} successfully`, 'success');
}

// KPI click handlers
export function wireKpiClicks() {
  document.querySelectorAll('.kpi-item').forEach(item => {
    item.addEventListener('click', () => {
      const kpiType = item.dataset.kpi;
      
      // Apply KPI-specific filter
      let filterUpdate = {};
      switch(kpiType) {
        case 'wti':
          filterUpdate.commodity = 'WTI';
          break;
        case 'brent':
          filterUpdate.commodity = 'Brent';
          break;
        case 'basis':
          filterUpdate.location = 'Houston';
          break;
        case 'hedge':
          // For hedge ratio, don't change filters but show toast
          showToast('Hedge ratio filter applied to dashboard', 'success');
          return;
      }
      
      // Update filters
      if (Object.keys(filterUpdate).length > 0) {
        // Update UI
        Object.entries(filterUpdate).forEach(([key, value]) => {
          const element = document.getElementById(`${key}Filter`);
          if (element) element.value = value;
        });
        
        updateFilters(filterUpdate);
        document.dispatchEvent(new CustomEvent('filters:changed', { 
          detail: currentFilters 
        }));
        
        showToast(`Filtered by ${kpiType.toUpperCase()}`, 'success');
      }
    });
    
    // Add keyboard support
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

// Initialize all UI event handlers
export function initEventHandlers() {
  // Drawer controls
  document.getElementById('closeDrawer')?.addEventListener('click', closeDrawer);
  document.getElementById('drawerOverlay')?.addEventListener('click', closeDrawer);
  document.getElementById('invoiceButton')?.addEventListener('click', handleInvoiceButton);
  
  // Navigation (visual only)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
  
  // Escape key to close drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeDrawer();
    }
  });
  
  // Loading spinner control
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    // Show spinner initially
    spinner.setAttribute('aria-hidden', 'false');
    
    // Hide after initial load
    setTimeout(() => {
      spinner.setAttribute('aria-hidden', 'true');
    }, 1500);
  }
}

// Update all UI components
export function updateUI() {
  renderTrades();
  renderRecs();
  renderHeatmap();
  updateKpis(currentFilters);
}
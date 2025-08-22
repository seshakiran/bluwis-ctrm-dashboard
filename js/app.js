/*
 * app.js — Entry point wiring everything together
 */
import { initKpis, initMarketChart, initMap } from './charts.js';
import { 
  initFilters, 
  renderTrades, 
  renderRecs, 
  renderHeatmap, 
  wireForecastToggle,
  wireKpiClicks,
  initEventHandlers,
  updateUI 
} from './ui.js';
import { startTour } from './tour.js';

// Global state
let appInitialized = false;

// Initialize the application
function initApp() {
  console.log('🚀 Initializing Bluwis Dashboard...');
  
  try {
    // Initialize UI components first
    initEventHandlers();
    initFilters();
    
    // Wire up interactive elements
    wireForecastToggle();
    wireKpiClicks();
    
    // Initial render of data components with delay to ensure DOM is ready
    setTimeout(() => {
      renderTrades();
      renderRecs();
      renderHeatmap();
      console.log('✅ Initial data rendered');
    }, 100);
    
    // Initialize charts immediately
    initCharts();
    
    // Initialize flow arrows after a short delay
    setTimeout(() => {
      initFlowArrows();
    }, 100);
    
    // Wire up tour
    const tourButton = document.getElementById('startTour');
    if (tourButton) {
      tourButton.addEventListener('click', startTour);
    }
    
    // Set up filter change listener
    document.addEventListener('filters:changed', handleFiltersChanged);
    
    // Mark as initialized
    appInitialized = true;
    
    console.log('✅ Dashboard initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing dashboard:', error);
    showErrorMessage('Failed to initialize dashboard. Please refresh the page.');
  }
}

// Initialize charts immediately for better performance
function initCharts() {
  console.log('📊 Initializing charts...');
  
  // Check if dependencies are loaded
  if (!window.Chart) {
    console.error('Chart.js not loaded');
    return;
  }
  
  if (!window.L) {
    console.error('Leaflet not loaded');
    return;
  }
  
  try {
    // Initialize all charts immediately
    const kpiCanvasIds = ['kpi1', 'kpi2', 'kpi3', 'kpi4'];
    initKpis(kpiCanvasIds);
    
    initMarketChart('marketChart');
    
    initMap('vesselMap');
    
    console.log('✅ All charts initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing charts:', error);
    showErrorMessage('Failed to initialize charts. Please refresh the page.');
  }
}

// Handle filter changes
function handleFiltersChanged(event) {
  if (!appInitialized) return;
  
  console.log('🔄 Filters changed:', event.detail);
  
  try {
    // Update UI components that respond to filters
    renderTrades();
    
    // In a real app, you might also update:
    // - KPI values based on filtered data
    // - Chart series based on selected commodities
    // - Risk metrics for filtered positions
    // - Recommendations based on current filter context
    
  } catch (error) {
    console.error('Error updating filtered data:', error);
  }
}

// Show error message to user
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-banner';
  errorDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #dc2626;
    color: white;
    padding: 16px;
    text-align: center;
    z-index: 9999;
    font-weight: 500;
  `;
  errorDiv.textContent = message;
  
  document.body.insertBefore(errorDiv, document.body.firstChild);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

// Check if required dependencies are loaded
function checkDependencies() {
  const dependencies = [
    { name: 'Chart.js', check: () => window.Chart },
    { name: 'Leaflet', check: () => window.L }
  ];
  
  const missing = dependencies.filter(dep => !dep.check());
  
  if (missing.length > 0) {
    const missingNames = missing.map(dep => dep.name).join(', ');
    throw new Error(`Missing dependencies: ${missingNames}`);
  }
}

// Application lifecycle
function onDOMContentLoaded() {
  try {
    checkDependencies();
    initApp();
  } catch (error) {
    console.error('Failed to start application:', error);
    showErrorMessage('Failed to load required dependencies. Please check your internet connection and refresh.');
  }
}

// Handle page visibility changes (pause/resume functionality)
function handleVisibilityChange() {
  if (document.hidden) {
    console.log('📱 App paused (tab hidden)');
  } else {
    console.log('📱 App resumed (tab visible)');
    // Could refresh data here if needed
  }
}

// Initialize flow arrows between dashboard components
function initFlowArrows() {
  try {
    const svg = document.querySelector('.flow-arrows');
    if (!svg) return;
    
    // Get card positions
    const metrics = document.getElementById('kpis');
    const trades = document.querySelector('.trade-card');
    const market = document.getElementById('marketCard');
    const recs = document.getElementById('recs');
    
    if (!metrics || !trades || !market || !recs) {
      console.warn('Some dashboard cards not found for arrow positioning');
      return;
    }
    
    const dashboardRect = document.querySelector('.dashboard').getBoundingClientRect();
    const metricsRect = metrics.getBoundingClientRect();
    const tradesRect = trades.getBoundingClientRect();
    const marketRect = market.getBoundingClientRect();
    const recsRect = recs.getBoundingClientRect();
    
    // Calculate relative positions
    const getRelativePos = (rect) => ({
      x: rect.left - dashboardRect.left + rect.width / 2,
      y: rect.top - dashboardRect.top + rect.height / 2,
      right: rect.right - dashboardRect.left,
      bottom: rect.bottom - dashboardRect.top
    });
    
    const metricsPos = getRelativePos(metricsRect);
    const tradesPos = getRelativePos(tradesRect);
    const marketPos = getRelativePos(marketRect);
    const recsPos = getRelativePos(recsRect);
    
    // Update SVG viewBox
    svg.setAttribute('viewBox', `0 0 ${dashboardRect.width} ${dashboardRect.height}`);
    svg.style.width = dashboardRect.width + 'px';
    svg.style.height = dashboardRect.height + 'px';
    
    // Create arrow paths
    const arrows = [
      {
        id: 'arrow1',
        from: { x: metricsPos.right - 20, y: metricsPos.y },
        to: { x: tradesPos.x - metricsPos.x + 20, y: tradesPos.y },
        label: 'Trade Data',
        offset: { x: 0, y: -10 }
      },
      {
        id: 'arrow2', 
        from: { x: metricsPos.x, y: metricsPos.bottom - 20 },
        to: { x: marketPos.x, y: marketPos.y - 20 },
        label: 'Price Signals',
        offset: { x: 20, y: 0 }
      },
      {
        id: 'arrow3',
        from: { x: marketPos.right - 20, y: marketPos.y },
        to: { x: recsPos.x - 20, y: recsPos.y },
        label: 'Forecast Data',
        offset: { x: 0, y: -10 }
      }
    ];
    
    // Generate arrow SVG
    svg.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" 
         refX="7" refY="3" orient="auto" fill="#94a3b8">
          <polygon points="0 0, 8 3, 0 6" />
        </marker>
      </defs>
      ${arrows.map(arrow => {
        const midX = (arrow.from.x + arrow.to.x) / 2;
        const midY = (arrow.from.y + arrow.to.y) / 2;
        const controlX = midX + arrow.offset.x;
        const controlY = midY + arrow.offset.y;
        
        return `
          <path d="M ${arrow.from.x} ${arrow.from.y} Q ${controlX} ${controlY} ${arrow.to.x} ${arrow.to.y}" 
                stroke="#94a3b8" 
                stroke-width="2" 
                stroke-dasharray="4,4" 
                fill="none" 
                marker-end="url(#arrowhead)"
                opacity="0.6" />
          <text x="${controlX}" y="${controlY - 5}" 
                font-size="10" 
                fill="#64748b" 
                text-anchor="middle"
                font-weight="500">
            ${arrow.label}
          </text>
        `;
      }).join('')}
    `;
    
    console.log('🔗 Flow arrows initialized');
    
  } catch (error) {
    console.error('Error initializing flow arrows:', error);
  }
}

// Handle window resize for responsive charts
function handleResize() {
  if (!appInitialized) return;
  
  // Debounce resize handling
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    console.log('📐 Window resized, updating charts...');
    
    // Re-position flow arrows
    initFlowArrows();
    
  }, 250);
}

// Development helpers
function setupDevMode() {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Development mode enabled');
    
    // Add global helpers for debugging
    window.bluwisDebug = {
      getAppState: () => ({
        initialized: appInitialized,
        charts: window.Chart?.instances?.length || 0,
        mapLoaded: !!window.L
      }),
      triggerError: () => {
        throw new Error('Test error for debugging');
      },
      refreshData: () => {
        updateUI();
      }
    };
    
    // Add visual indicator
    document.body.style.borderTop = '3px solid #ff6b35';
  }
}

// Event listeners
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
} else {
  // DOM already loaded
  onDOMContentLoaded();
}

document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('resize', handleResize);
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showErrorMessage('An unexpected error occurred. Please refresh the page.');
});

// Setup development helpers
setupDevMode();

// Service worker registration (if available)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Export for global access if needed
window.BluwisApp = {
  init: initApp,
  updateUI,
  startTour
};

export { initApp, updateUI };
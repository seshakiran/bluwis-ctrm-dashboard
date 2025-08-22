/*
 * tour.js — lightweight guided tour
 */

let currentTour = null;

export function startTour() {
  const steps = [
    { sel: '#filters', text: 'Use these filters to focus the dashboard data. Try selecting different commodities, locations, or dates to see how the data updates.' },
    { sel: '#kpis', text: 'These KPI sparklines show key metrics at a glance. Click on any KPI to apply it as a global filter.' },
    { sel: '#marketCard', text: 'Market prices chart shows historical data for WTI and Brent. Toggle the "Forecast Overlay" to see AI-generated price predictions.' },
    { sel: '#recs', text: 'AI Recommendations provide trading suggestions. Click "Apply as Hedge" on any recommendation to add it as a new trade.' },
    { sel: '#tradeTable', text: 'Trade Capture table shows all your trades. Click on any row to open detailed information in a drawer.' },
    { sel: '#riskMap', text: 'Risk heatmap and vessel tracking provide additional portfolio insights. The tour is complete!' }
  ];
  
  let currentStep = 0;
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'tour';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-labelledby', 'tour-title');
  overlay.setAttribute('aria-describedby', 'tour-description');
  document.body.appendChild(overlay);
  
  // Focus trap
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  function showStep(stepIndex) {
    const step = steps[stepIndex];
    const target = document.querySelector(step.sel);
    
    if (!target) {
      console.warn(`Tour target not found: ${step.sel}`);
      return;
    }
    
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Highlight target element
    target.style.position = 'relative';
    target.style.zIndex = '2001';
    target.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.5)';
    
    // Position callout
    let calloutTop = rect.top + scrollTop - 10;
    let calloutLeft = rect.left + rect.width + 16;
    
    // Adjust if callout would be off-screen
    if (calloutLeft + 300 > window.innerWidth) {
      calloutLeft = rect.left - 316; // 300px width + 16px margin
    }
    if (calloutTop < 0) {
      calloutTop = rect.top + scrollTop + rect.height + 16;
    }
    
    overlay.innerHTML = `
      <div class="callout" style="top:${calloutTop}px;left:${calloutLeft}px">
        <h4 id="tour-title">Step ${stepIndex + 1} of ${steps.length}</h4>
        <p id="tour-description">${step.text}</p>
        <div class="actions">
          <button id="tourPrev" ${stepIndex === 0 ? 'disabled' : ''}>Back</button>
          <button id="tourNext">${stepIndex === steps.length - 1 ? 'Finish' : 'Next'}</button>
          <button id="tourSkip">Skip Tour</button>
        </div>
      </div>`;
    
    // Add event listeners
    const prevBtn = document.getElementById('tourPrev');
    const nextBtn = document.getElementById('tourNext');
    const skipBtn = document.getElementById('tourSkip');
    
    if (prevBtn && stepIndex > 0) {
      prevBtn.addEventListener('click', () => {
        clearHighlight();
        showStep(stepIndex - 1);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (stepIndex < steps.length - 1) {
          clearHighlight();
          showStep(stepIndex + 1);
        } else {
          stopTour();
        }
      });
    }
    
    if (skipBtn) {
      skipBtn.addEventListener('click', stopTour);
    }
    
    // Focus the next button
    nextBtn?.focus();
    
    // Update current step
    currentStep = stepIndex;
    
    // Scroll target into view
    target.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }
  
  function clearHighlight() {
    // Remove highlights from all elements
    document.querySelectorAll('[style*="z-index: 2001"]').forEach(el => {
      el.style.position = '';
      el.style.zIndex = '';
      el.style.boxShadow = '';
    });
  }
  
  function stopTour() {
    clearHighlight();
    if (overlay && overlay.parentNode) {
      overlay.remove();
    }
    document.removeEventListener('keydown', handleKeydown);
    currentTour = null;
    
    // Restore focus to start tour button
    const startBtn = document.getElementById('startTour');
    if (startBtn) {
      startBtn.focus();
    }
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      stopTour();
      return;
    }
    
    // Tab key navigation within tour
    if (e.key === 'Tab') {
      const focusable = overlay.querySelectorAll(focusableElements);
      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];
      
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
    
    // Arrow key navigation
    if (e.key === 'ArrowLeft' && currentStep > 0) {
      e.preventDefault();
      clearHighlight();
      showStep(currentStep - 1);
    } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
      e.preventDefault();
      clearHighlight();
      showStep(currentStep + 1);
    }
  }
  
  // Prevent background scrolling
  document.body.style.overflow = 'hidden';
  
  // Add keyboard event listener
  document.addEventListener('keydown', handleKeydown);
  
  // Store current tour reference
  currentTour = { overlay, stopTour };
  
  // Start the tour
  showStep(0);
}

export function stopTour() {
  if (currentTour) {
    currentTour.stopTour();
  }
}

// Auto-cleanup if page unloads
window.addEventListener('beforeunload', () => {
  if (currentTour) {
    document.body.style.overflow = '';
  }
});
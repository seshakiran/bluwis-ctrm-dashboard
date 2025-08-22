// Validation script to run in browser console
// Copy and paste this into the browser console when viewing index.html

console.log('🔍 Starting Dashboard Validation...');

function validateElement(selector, name) {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ ${name} found`);
    return true;
  } else {
    console.error(`❌ ${name} missing`);
    return false;
  }
}

function validateFunction(funcName, obj = window) {
  if (typeof obj[funcName] === 'function') {
    console.log(`✅ Function ${funcName} available`);
    return true;
  } else {
    console.error(`❌ Function ${funcName} missing`);
    return false;
  }
}

// Test DOM elements
console.log('\n📋 Testing DOM Elements:');
const domTests = [
  ['#kpis', 'KPI Metrics section'],
  ['#tradeTable', 'Trade table'],
  ['#marketChart', 'Market chart canvas'],
  ['#recs', 'Recommendations section'],
  ['#riskHeatmap', 'Risk heatmap'],
  ['#vesselMap', 'Vessel map'],
  ['#startTour', 'Tour button'],
  ['#tradeDrawer', 'Trade drawer'],
  ['#toastContainer', 'Toast container'],
  ['.flow-arrows', 'Flow arrows SVG'],
  ['#commodityFilter', 'Commodity filter'],
  ['#forecastToggle', 'Forecast toggle']
];

let domPassed = 0;
domTests.forEach(([selector, name]) => {
  if (validateElement(selector, name)) domPassed++;
});

// Test global objects
console.log('\n🌐 Testing Global Objects:');
const globalTests = [
  ['Chart', window],
  ['L', window],
  ['BluwisApp', window]
];

let globalPassed = 0;
globalTests.forEach(([name, obj]) => {
  if (obj[name]) {
    console.log(`✅ ${name} available`);
    globalPassed++;
  } else {
    console.error(`❌ ${name} missing`);
  }
});

// Test interactions
console.log('\n🖱️ Testing Interactions:');

function testFilters() {
  try {
    const commodityFilter = document.getElementById('commodityFilter');
    if (commodityFilter && commodityFilter.options.length > 1) {
      console.log('✅ Commodity filter populated');
      // Test filter change
      commodityFilter.value = commodityFilter.options[1].value;
      commodityFilter.dispatchEvent(new Event('change'));
      console.log('✅ Filter change event triggered');
      return true;
    } else {
      console.error('❌ Commodity filter not populated');
      return false;
    }
  } catch (error) {
    console.error('❌ Filter test failed:', error);
    return false;
  }
}

function testTradeTable() {
  try {
    const rows = document.querySelectorAll('#tradeTableBody tr');
    if (rows.length > 0) {
      console.log(`✅ Trade table has ${rows.length} rows`);
      // Test row click
      rows[0].click();
      setTimeout(() => {
        const drawer = document.getElementById('tradeDrawer');
        if (drawer && drawer.classList.contains('open')) {
          console.log('✅ Trade drawer opens on row click');
          // Close drawer
          document.getElementById('closeDrawer')?.click();
        } else {
          console.error('❌ Trade drawer did not open');
        }
      }, 100);
      return true;
    } else {
      console.error('❌ No trade table rows found');
      return false;
    }
  } catch (error) {
    console.error('❌ Trade table test failed:', error);
    return false;
  }
}

function testRecommendations() {
  try {
    const applyButtons = document.querySelectorAll('.btn-apply');
    if (applyButtons.length > 0) {
      console.log(`✅ Found ${applyButtons.length} recommendation apply buttons`);
      // Test apply button
      applyButtons[0].click();
      setTimeout(() => {
        const toasts = document.querySelectorAll('.toast');
        if (toasts.length > 0) {
          console.log('✅ Toast notification appears after applying recommendation');
        } else {
          console.error('❌ No toast notification after applying recommendation');
        }
      }, 100);
      return true;
    } else {
      console.error('❌ No recommendation apply buttons found');
      return false;
    }
  } catch (error) {
    console.error('❌ Recommendations test failed:', error);
    return false;
  }
}

function testForecastToggle() {
  try {
    const toggle = document.getElementById('forecastToggle');
    if (toggle) {
      console.log('✅ Forecast toggle found');
      // Test toggle
      toggle.checked = true;
      toggle.dispatchEvent(new Event('change'));
      console.log('✅ Forecast toggle event triggered');
      return true;
    } else {
      console.error('❌ Forecast toggle not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Forecast toggle test failed:', error);
    return false;
  }
}

function testTour() {
  try {
    const tourButton = document.getElementById('startTour');
    if (tourButton) {
      console.log('✅ Tour button found');
      tourButton.click();
      setTimeout(() => {
        const tourOverlay = document.querySelector('.tour');
        if (tourOverlay) {
          console.log('✅ Tour overlay appears');
          // Close tour with ESC
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
          setTimeout(() => {
            if (!document.querySelector('.tour')) {
              console.log('✅ Tour closes with ESC key');
            }
          }, 100);
        } else {
          console.error('❌ Tour overlay did not appear');
        }
      }, 100);
      return true;
    } else {
      console.error('❌ Tour button not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Tour test failed:', error);
    return false;
  }
}

// Run interaction tests
let interactionPassed = 0;
const interactionTests = [testFilters, testTradeTable, testRecommendations, testForecastToggle, testTour];
interactionTests.forEach(test => {
  if (test()) interactionPassed++;
});

// Test charts
console.log('\n📊 Testing Charts:');
setTimeout(() => {
  let chartsPassed = 0;
  
  // Test KPI charts
  const kpiCanvases = document.querySelectorAll('#kpis canvas');
  if (kpiCanvases.length === 4) {
    console.log('✅ All 4 KPI canvases found');
    chartsPassed++;
  } else {
    console.error(`❌ Expected 4 KPI canvases, found ${kpiCanvases.length}`);
  }
  
  // Test market chart
  const marketChart = document.getElementById('marketChart');
  if (marketChart) {
    console.log('✅ Market chart canvas found');
    chartsPassed++;
  } else {
    console.error('❌ Market chart canvas not found');
  }
  
  // Test map
  const mapContainer = document.getElementById('vesselMap');
  if (mapContainer && mapContainer.hasChildNodes()) {
    console.log('✅ Vessel map initialized');
    chartsPassed++;
  } else {
    console.error('❌ Vessel map not initialized');
  }
  
  // Final summary
  console.log('\n📊 VALIDATION SUMMARY:');
  console.log(`DOM Elements: ${domPassed}/${domTests.length} passed`);
  console.log(`Global Objects: ${globalPassed}/${globalTests.length} passed`);
  console.log(`Interactions: ${interactionPassed}/${interactionTests.length} passed`);
  console.log(`Charts: ${chartsPassed}/3 passed`);
  
  const total = domPassed + globalPassed + interactionPassed + chartsPassed;
  const maxTotal = domTests.length + globalTests.length + interactionTests.length + 3;
  
  console.log(`\n🎯 OVERALL SCORE: ${total}/${maxTotal} (${Math.round(total/maxTotal*100)}%)`);
  
  if (total >= maxTotal * 0.8) {
    console.log('🎉 Dashboard validation PASSED! Ready for use.');
  } else {
    console.log('⚠️ Dashboard validation FAILED. Check errors above.');
  }
}, 2000);

console.log('\n⏳ Running validation tests... (results in 2 seconds)');
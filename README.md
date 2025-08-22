# Bluwis CTRM + AI Dashboard

A modern, interactive commodity trading and risk management dashboard with AI-powered insights. Built with vanilla HTML, CSS, and JavaScript for maximum compatibility and ease of deployment.

![Dashboard Preview](Screen%20mokeup.png)

## 🚀 Features

### Dashboard Components
- **📊 KPI Metrics** - Interactive sparklines for WTI, Brent, Basis, and Hedge Ratio
- **📈 Market Prices** - Real-time price charts with AI forecast overlay
- **💼 Trade Capture** - Interactive trade table with detailed drawer view
- **🤖 AI Recommendations** - Smart trading suggestions with confidence scores
- **🎯 Risk Metrics** - Color-coded heatmap for portfolio risk assessment
- **🚢 Vessel Tracking** - Live vessel positions and route monitoring

### Interactive Features
- **🔍 Dynamic Filters** - Filter by commodity, location, counterparty, and date
- **🎪 Guided Tour** - 6-step walkthrough for new users
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile
- **♿ Accessibility** - Full keyboard navigation and screen reader support
- **🔗 Data Flow Visualization** - Arrows showing system relationships

## 🎯 Quick Start

### Option 1: Direct File Access
```bash
# Simply open the file in any modern browser
open index.html
```

### Option 2: Local Server (Recommended)
```bash
# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Option 3: GitHub Pages
This repository is configured for GitHub Pages deployment. Simply enable Pages in repository settings.

## 🧪 Testing & Validation

### Automated Testing
```javascript
// Open browser console (F12) and run:
// Copy contents of validate.js and paste in console
```

### Manual Testing Checklist
- [ ] All dashboard cards load without errors
- [ ] Filters update data in real-time
- [ ] Trade rows open detailed drawer on click
- [ ] Forecast toggle shows/hides prediction bands
- [ ] AI recommendations can be applied as new trades
- [ ] Guided tour completes all 6 steps
- [ ] Mobile responsive layout works
- [ ] No console errors or warnings

## 📁 File Structure

```
├── index.html              # Main dashboard page
├── styles.css              # Responsive CSS styling
├── js/
│   ├── data.js             # Mock data and generators
│   ├── charts.js           # Chart.js and Leaflet integration
│   ├── ui.js               # DOM manipulation and interactions
│   ├── tour.js             # Guided tour functionality
│   └── app.js              # Main application orchestration
├── validate.js             # Browser console validation script
├── test.html               # Automated testing page
└── README.md               # This file
```

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, ES6 JavaScript
- **Charts**: [Chart.js](https://www.chartjs.org/) for sparklines and line charts
- **Maps**: [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles
- **Icons**: Unicode symbols and CSS-based icons
- **Dependencies**: All loaded via CDN (no build process required)

## 🎨 Customization

### Data Customization
Edit `js/data.js` to modify:
- Commodity types and trading venues
- Counterparty names and locations
- Historical price data and forecasts
- Risk metrics and AI recommendations

### Styling
Edit `styles.css` to customize:
- Color scheme and branding
- Layout and spacing
- Component styling
- Responsive breakpoints

### Charts
Edit `js/charts.js` to modify:
- Chart types and configurations
- Map center point and zoom levels
- Data visualization options

## 🎪 Demo Guide

### For Colleagues & Stakeholders

1. **Start with the Tour** - Click "Start Tour" for guided walkthrough
2. **Show Interactivity** - Demonstrate filters, drill-downs, and real-time updates
3. **Highlight AI Features** - Apply recommendations and show forecast overlays
4. **Demonstrate Mobile** - Resize browser or use mobile device
5. **Show Technical Quality** - Run validation script in console

### Key Talking Points
- **Modern UX** - Intuitive interface with smooth animations
- **Real-time Insights** - Live data updates and AI-powered recommendations
- **Scalable Architecture** - Modular design ready for enterprise integration
- **Accessibility First** - Inclusive design for all users
- **Zero Setup** - Runs anywhere with just a browser

## 🔧 Development

### Adding New Features
1. **Data**: Add new datasets in `js/data.js`
2. **UI**: Create new components in `js/ui.js`
3. **Charts**: Add visualizations in `js/charts.js`
4. **Routing**: Wire components in `js/app.js`

### Best Practices
- Use semantic HTML for accessibility
- Follow existing CSS naming conventions
- Write modular, testable JavaScript
- Update validation script for new features

## 🚀 Deployment Options

### GitHub Pages
1. Push to GitHub repository
2. Enable Pages in repository settings
3. Select source branch (main)
4. Access via `https://username.github.io/repository-name`

### Traditional Web Server
1. Upload all files to web server
2. Ensure HTTPS for Leaflet maps
3. Configure proper MIME types for `.js` modules

### Docker
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

## 📊 Performance

- **Load Time**: < 2 seconds on broadband
- **Bundle Size**: ~500KB (including images)
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Performance**: Optimized for 3G+ connections

## 🔐 Security Notes

This is a **prototype/demo application** with mock data. For production use:
- Implement proper authentication
- Add input validation and sanitization
- Use HTTPS for all communications
- Follow OWASP security guidelines
- Implement proper error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions, issues, or demo requests:
- Open an issue in this repository
- Review the validation script output for troubleshooting
- Check browser console for error messages

---

**Built with ❤️ for modern commodity trading and risk management**
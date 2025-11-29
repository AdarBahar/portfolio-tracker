# 📊 Portfolio Tracker

A modern, accessible, and database-ready portfolio tracking application built with vanilla JavaScript.

## Features

- 🔐 **Google Authentication** - Sign in with Google or try demo mode
- 👤 **Multi-User Support** - Each user has isolated, personalized data
- 📈 **Real-time Portfolio Tracking** - Monitor your investments with live updates
- 💰 **Dividend Tracking** - Track dividend income and estimated annual returns
- 📊 **Interactive Charts** - Visualize sector allocation, performance, and trends
- 🔍 **Search & Filter** - Quickly find holdings by ticker or company name
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Easy on the eyes with theme toggle
- ♿ **Accessible** - WCAG compliant with keyboard navigation and screen reader support
- 🔒 **Secure** - OAuth 2.0, XSS prevention, and input validation
- 🗄️ **Database-Ready** - Easy migration to API/database backend

## Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd portfolio-tracker
   ```

2. **Set up Google OAuth (optional):**
   - See `GOOGLE_OAUTH_SETUP.md` for detailed instructions
   - Or use Demo Mode (no setup required)

3. **Start a local server:**
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```

4. **Open in browser:**
   ```
   http://localhost:8000/login.html
   ```

5. **Sign in:**
   - **Google Sign-In:** Requires OAuth setup (see step 2)
   - **Demo Mode:** Works immediately, no setup needed

That's it! No build process required for development.

## Project Structure

```
portfolio-tracker/
├── index.html                      # Main app page
├── login.html                      # Login page
├── styles/
│   ├── style.css                   # Main styles
│   └── login.css                   # Login page styles
├── scripts/
│   ├── app.js                      # Main entry point
│   ├── login.js                    # Login page logic
│   ├── auth.js                     # Authentication manager
│   ├── state.js                    # State management
│   ├── dataService.js              # Data persistence layer
│   ├── ui.js                       # UI updates
│   ├── charts.js                   # Chart rendering
│   ├── sparklines.js               # Sparkline rendering
│   ├── interactions.js             # User interactions
│   ├── modals.js                   # Modal management
│   ├── calculations.js             # Financial calculations
│   ├── utils.js                    # Utility functions
│   ├── constants.js                # Configuration
│   └── sampleData.js               # Demo data
├── schema.mysql.sql                # MySQL database schema
├── DATABASE_SETUP_MYSQL.md         # Database setup guide
├── DATABASE_MIGRATION_GUIDE.md     # Backend migration guide
├── DATABASE_SCHEMA_DIAGRAM.md      # Schema diagrams
├── DATABASE_SCHEMA_SUMMARY.md      # Schema reference
├── DATABASE_FILES_README.md        # Database files overview
├── REFACTORING.md                  # Refactoring documentation
├── IMPLEMENTATION_SUMMARY.md       # Implementation summary
├── AUTHENTICATION_SUMMARY.md       # Authentication documentation
└── GOOGLE_OAUTH_SETUP.md           # Google OAuth setup guide
```

## Architecture

### Modular Design

The application is built with a modular architecture for maintainability:

- **State Management** - Centralized state with change notifications
- **Data Service Layer** - Abstraction for easy storage backend swapping
- **Pure Functions** - Testable utility and calculation functions
- **Separation of Concerns** - UI, business logic, and data layers separated

### Data Flow

```
User Action → State Update → Notify Listeners → Update UI
                ↓
           Data Service
                ↓
        localStorage (current)
        MySQL/API (migration ready - see DATABASE_MIGRATION_GUIDE.md)
```

## Key Features

### 1. Portfolio Metrics
- Total portfolio value
- Total gain/loss ($ and %)
- Dividend income YTD
- Today's change
- Best/worst performers
- Portfolio beta

### 2. Holdings Management
- Add new positions
- View all holdings
- Search by ticker or company
- Filter by sector
- Sort by any column
- Interactive sparkline charts

### 3. Visualizations
- Sector allocation pie chart
- Asset class allocation pie chart
- Performance bar chart
- Dividend income bar chart
- 30-day price trends (sparklines)
- Detailed price history with moving averages

### 4. Stock Insights
- Analyst ratings
- Price targets
- Key factors
- Risk analysis
- Educational content

### 5. Data Export
- Export portfolio summary
- Copy to clipboard
- Plain text format

## Database Migration

The application is designed for easy migration to a database backend. See `DATABASE_MIGRATION_GUIDE.md` for detailed instructions.

**Quick overview:**

1. Implement backend API (Node.js, Python, etc.)
2. Complete the `ApiAdapter` class in `dataService.js`
3. Update `app.js` to use `ApiAdapter` instead of `LocalStorageAdapter`
4. Deploy!

**No changes to business logic or UI code required!**

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility

- ✅ WCAG 2.1 Level AA compliant
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ ARIA labels
- ✅ Semantic HTML

## Security

- ✅ XSS prevention (input sanitization)
- ✅ Input validation
- ✅ No eval() or innerHTML with user data
- ✅ Content Security Policy ready

## Performance

- ✅ No memory leaks (proper chart cleanup)
- ✅ Debounced search
- ✅ Efficient re-rendering
- ✅ Lazy loading ready

## Development

### Adding a New Feature

1. **Add constants** to `constants.js` if needed
2. **Add calculations** to `calculations.js` if needed
3. **Add UI updates** to `ui.js`
4. **Update state** in `state.js` if needed
5. **Wire up in** `app.js`

### Testing

Currently using manual testing. Unit tests recommended (Jest/Vitest).

**Test checklist:**
- [ ] Add position
- [ ] Search holdings
- [ ] Filter by sector
- [ ] Sort table
- [ ] View sparkline tooltip
- [ ] Click sparkline for detail
- [ ] View stock insights
- [ ] Export summary
- [ ] Toggle dark mode
- [ ] Refresh page (data persists)

## Database Migration

This project is **database-ready** with a complete MySQL schema and migration guide.

### Quick Start

1. **Create MySQL database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE portfolio_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

2. **Import schema:**
   ```bash
   mysql -u root -p portfolio_tracker < schema.mysql.sql
   ```

3. **Verify:**
   ```sql
   SHOW TABLES;
   -- Should show: users, holdings, dividends, transactions
   ```

### Database Features

- ✅ **Google OAuth support** - Stores Google user ID and profile picture
- ✅ **Email/password support** - Stores password hash
- ✅ **Demo mode support** - Flagged demo users
- ✅ **Per-user data isolation** - Each user's data is separate
- ✅ **Foreign key constraints** - Data integrity
- ✅ **Cascade delete** - Delete user → delete all data
- ✅ **Indexes** - Fast queries

### Documentation

- **`schema.mysql.sql`** - MySQL database schema
- **`DATABASE_SETUP_MYSQL.md`** - Step-by-step setup guide
- **`DATABASE_MIGRATION_GUIDE.md`** - Complete backend migration guide
- **`DATABASE_SCHEMA_DIAGRAM.md`** - Visual schema diagrams
- **`DATABASE_SCHEMA_SUMMARY.md`** - Quick reference
- **`DATABASE_FILES_README.md`** - Overview of all database files

## Deployment

### React Frontend (Current)

The project now includes a modern React frontend built with Vite. See below for build and deployment instructions.

#### Build for Production

```bash
cd frontend-react
npm install
npm run build
```

This creates optimized production build in the `react/` folder:
- `react/index.html` - Main HTML file
- `react/assets/` - Minified JavaScript and CSS
- `react/.htaccess` - Apache configuration with security headers

#### Deploy to Production

**Option 1: Using rsync (recommended)**

```bash
rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/
```

**Option 2: Manual upload**

1. Connect to server via SFTP
2. Upload contents of `react/` folder to `/var/www/fantasy-broker/react/`
3. Set permissions: `chmod -R 755 react/` and `chmod -R 644 react/assets/*`

#### Verify Deployment

1. Open https://www.bahar.co.il/fantasybroker/react/
2. Open DevTools Console (F12)
3. Check for errors - should be NONE
4. Navigate to dashboard and verify data loads
5. Check Network tab for API calls

#### Environment Configuration

The React app automatically detects the environment:

- **Production** (www.bahar.co.il): Uses `https://www.bahar.co.il/fantasybroker-api/api`
- **Development** (localhost): Uses `http://localhost:4000/api`

To override, create `.env.production` in `frontend-react/`:

```env
VITE_API_URL=https://your-api-endpoint/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

#### Local Development

```bash
cd frontend-react
npm install
npm run dev
```

Then open http://localhost:5173/fantasybroker/react/

#### Troubleshooting

**CSP Errors in Console**

If you see "violates Content Security Policy" errors:
1. Check the error message for the blocked URL
2. Add the domain to `connect-src` in `frontend-react/public/.htaccess`
3. Rebuild: `npm run build`
4. Redeploy

**API Connection Errors**

If the app can't connect to the API:
1. Verify the API endpoint is correct
2. Check that the API server is running
3. Verify CORS headers are set correctly
4. Check browser console for detailed error messages

**COOP Errors**

If you see "Cross-Origin-Opener-Policy policy would block the window.postMessage call":
1. This is expected for cross-origin communication
2. The `.htaccess` file includes proper COOP headers
3. Verify `.htaccess` is deployed to the server
4. Check Apache modules: `mod_headers`, `mod_rewrite`, `mod_deflate`

### Static Hosting (Legacy)

Deploy vanilla JS frontend to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- cPanel (current production)

### With Backend (Future)

1. Set up MySQL database (see Database Migration above)
2. Deploy backend API (Node.js/Python)
3. Deploy React frontend (see React Frontend section above)
4. Update API base URL in production build (automatic via hostname detection)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions, please open an issue on GitHub.

## Roadmap

### Completed ✅
- [x] Google OAuth authentication
- [x] Multi-user support
- [x] Database schema (MySQL)
- [x] Backend API implementation (Node.js + Express)
- [x] TypeScript migration (React frontend)
- [x] Build process (Vite)
- [x] React migration (Landing page, Login, Dashboard)
- [x] Production deployment (React frontend)

### In Progress 🚀
- [ ] Trade Room migration to React
- [ ] Admin Panel migration to React
- [ ] Charts and visualizations (React)
- [ ] Unit tests (React components)

### Planned 📋
- [ ] Real stock data API integration
- [ ] PWA support
- [ ] Mobile app
- [ ] Performance optimization
- [ ] E2E testing
- [ ] Analytics integration

## Credits

Built with:
- [Chart.js](https://www.chartjs.org/) - Charts
- Vanilla JavaScript - No framework needed!
- CSS Custom Properties - Theming
- ES6 Modules - Modular architecture

---

**Made with ❤️ for investors who code**


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

### React Frontend Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd portfolio-tracker
   ```

2. **Install dependencies:**
   ```bash
   cd frontend-react
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:5173/`

4. **Sign in:**
   - **Google Sign-In:** Works with localhost setup (see `GOOGLE_OAUTH_LOCALHOST_SETUP.md`)
   - **Demo Mode:** Works immediately, no setup needed

### Build for Production

```bash
cd frontend-react
npm run build
```

Output: `../react/` directory

See `BUILD_AND_DEPLOY.md` for complete build and deployment instructions.

### Legacy Vanilla JavaScript Version

The original vanilla JavaScript version is still available:

1. **Start a local server:**
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```

2. **Open in browser:**
   ```
   http://localhost:8000/login.html
   ```

## Project Structure

```
portfolio-tracker/
├── frontend-react/                 # React frontend (NEW)
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── contexts/               # React contexts
│   │   ├── utils/                  # Utility functions
│   │   ├── App.tsx                 # Main app component
│   │   └── main.tsx                # Entry point
│   ├── index.html                  # HTML template
│   ├── vite.config.ts              # Vite configuration
│   ├── tailwind.config.ts          # Tailwind CSS configuration
│   ├── package.json                # Dependencies
│   ├── .env.production             # Production environment
│   ├── .env.development            # Development environment
│   └── README.md                   # Frontend documentation
├── react/                          # Built React frontend (generated)
├── backend/                        # Node.js/Express backend
├── index.html                      # Legacy vanilla JS main page
├── login.html                      # Legacy vanilla JS login page
├── styles/                         # Legacy vanilla JS styles
├── scripts/                        # Legacy vanilla JS scripts
├── schema.mysql.sql                # MySQL database schema
├── BUILD_AND_DEPLOY.md             # Build and deployment guide
├── GOOGLE_OAUTH_FEDCM_SETUP.md     # Google Sign-In FedCM setup
├── GOOGLE_OAUTH_LOCALHOST_SETUP.md # Google Sign-In localhost setup
├── DATABASE_SETUP_MYSQL.md         # Database setup guide
├── DATABASE_MIGRATION_GUIDE.md     # Backend migration guide
├── DATABASE_SCHEMA_DIAGRAM.md      # Schema diagrams
├── DATABASE_SCHEMA_SUMMARY.md      # Schema reference
├── DATABASE_FILES_README.md        # Database files overview
├── REFACTORING.md                  # Refactoring documentation
├── IMPLEMENTATION_SUMMARY.md       # Implementation summary
├── AUTHENTICATION_SUMMARY.md       # Authentication documentation
├── docs/
│   └── PROJECT_HISTORY.md          # Project history and changes
└── README.md                       # This file
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

## React Frontend

The application now includes a modern React frontend with TypeScript, Tailwind CSS, and Vite.

### Features

- **Modern UI** - Built with React 18+ and TypeScript
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark Mode** - Theme switching with CSS variables
- **Reusable Components** - PageHeader, PageSection, StatCard, ProfileStrip, AnimatedButton
- **Animated Buttons** - Hover and click animations with loading/success states
- **Real-time Updates** - React Query for data fetching and caching
- **Type Safety** - Full TypeScript support
- **Accessibility** - WCAG compliant with proper focus management

### Development

```bash
cd frontend-react
npm install
npm run dev
```

### Production Build

```bash
cd frontend-react
npm run build
```

See `BUILD_AND_DEPLOY.md` for complete build and deployment instructions.

### Google Sign-In Setup

- **Development**: See `GOOGLE_OAUTH_LOCALHOST_SETUP.md`
- **Production**: See `GOOGLE_OAUTH_FEDCM_SETUP.md`

## Building and Deploying React Frontend

### Prerequisites

- **Node.js** 14+ (check with `node --version`)
- **npm** 6+ (check with `npm --version`)
- **Git** (for version control)
- **Production server** with Apache/Nginx (for deployment)
- **SSH access** to production server (for rsync/SCP deployment)

### Development Build

**Start the development server:**

```bash
cd frontend-react
npm install
npm run dev
```

The app will be available at `http://localhost:5173/`

**Features:**
- Hot Module Replacement (HMR) - changes reflect instantly
- Source maps - easier debugging
- TypeScript checking - catches errors before build
- Automatic browser refresh on file changes

### Production Build

**Step 1: Install dependencies**

```bash
cd frontend-react
npm install
```

**Step 2: Build the production bundle**

```bash
npm run build
```

This creates an optimized production build in the `react/` folder with:
- Minified JavaScript (~471KB, 136KB gzipped)
- Minified CSS (~51KB, 9.4KB gzipped)
- Source maps disabled (security)
- Tree-shaking enabled
- Code splitting for routes
- Gzip compression ready

**Step 3: Verify the build**

```bash
# Check that build completed successfully
ls -lah react/

# Should show:
# - index.html (main entry point)
# - assets/ (minified JS and CSS)
# - .htaccess (Apache configuration)
# - vite.svg (favicon)
```

**Step 4: Test the build locally (optional)**

```bash
# Install a simple HTTP server
npm install -g serve

# Serve the build
serve -s react -l 3000

# Open http://localhost:3000 in your browser
```

### Deployment Methods

#### Method 1: Using rsync (Recommended)

**Fastest and most reliable method:**

```bash
# From project root directory
rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/

# Verify deployment
ssh user@server "ls -lah /var/www/fantasy-broker/react/"
```

**With compression (slower upload, faster transfer):**

```bash
rsync -avz --compress --delete react/ user@server:/var/www/fantasy-broker/react/
```

#### Method 2: Using SCP

**Simple file copy method:**

```bash
# Copy all files
scp -r react/* user@server:/var/www/fantasy-broker/react/

# Verify
ssh user@server "ls -la /var/www/fantasy-broker/react/"
```

#### Method 3: Using Git on Server

**Requires Git on server:**

```bash
# On server
cd /var/www/fantasy-broker
git clone <repo-url> portfolio-tracker
cd portfolio-tracker/frontend-react
npm install
npm run build

# Built files are now in ../react/
```

#### Method 4: Using SFTP

1. Connect to server via SFTP client (FileZilla, Cyberduck, etc.)
2. Navigate to `/var/www/fantasy-broker/`
3. Upload entire `react/` folder contents
4. Verify all files are present

### Post-Deployment Verification

**Checklist:**

1. **Verify files are deployed**
   ```bash
   ssh user@server "ls -la /var/www/fantasy-broker/react/"
   ```

2. **Check app loads**
   ```
   https://www.bahar.co.il/fantasybroker/react/
   ```

3. **Check browser console for errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Should show NO errors (warnings are OK)

4. **Verify page loads correctly**
   - Login page should display
   - Google Sign-In button should be visible
   - Demo Mode button should be visible

5. **Test authentication**
   - Click "Continue in Demo Mode"
   - Should redirect to dashboard
   - Portfolio data should load

6. **Check API connectivity**
   - Open Network tab (F12)
   - Navigate to dashboard
   - Should see successful API calls (200 status)
   - No 403 or 401 errors

7. **Test theme toggle**
   - Click theme toggle button (Sun/Moon icon)
   - Theme should change immediately
   - Refresh page - theme should persist

8. **Test on mobile**
   - Open on mobile device
   - App should be responsive
   - Touch interactions should work

### Environment Configuration

**Development environment** (`.env.development`):

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your-dev-google-client-id.apps.googleusercontent.com
VITE_DISABLE_FEDCM=true
```

**Production environment** (`.env.production`):

```env
VITE_API_URL=https://www.bahar.co.il/fantasybroker-api/api
VITE_GOOGLE_CLIENT_ID=your-prod-google-client-id.apps.googleusercontent.com
```

**Note:** The app automatically detects the environment based on hostname. To override, create `.env.production` in `frontend-react/` and rebuild.

### Build Troubleshooting

**Build fails with TypeScript errors**

```bash
# Check for type errors
cd frontend-react
npm run type-check

# Fix errors and rebuild
npm run build
```

**Build succeeds but app doesn't load**

1. Check that `react/index.html` exists
2. Verify `.htaccess` is in `react/` folder
3. Check Apache error logs: `tail -f /var/log/apache2/error.log`
4. Verify Apache modules are enabled: `a2enmod headers rewrite deflate`

**Build is slow or hangs**

```bash
# Clear cache and rebuild
rm -rf frontend-react/node_modules frontend-react/.vite
npm install
npm run build
```

**Blank page or 404 errors after deployment**

1. Verify `react/index.html` exists on server
2. Check Apache configuration for correct document root
3. Verify `.htaccess` is in `react/` folder
4. Check Apache error logs for rewrite errors
5. Verify base path in `vite.config.ts` matches deployment path

### Performance Optimization

**Current build metrics:**
- JavaScript: 471.06KB (136.29KB gzipped)
- CSS: 51.13KB (9.42KB gzipped)
- Total modules: 1864
- Build time: ~2.67s

**To reduce bundle size:**

1. Use dynamic imports for large components
2. Remove unused dependencies
3. Enable tree-shaking in `vite.config.ts`
4. Consider code splitting for routes

**To improve load time:**

1. Enable gzip compression in Apache
2. Use CDN for static assets
3. Enable browser caching with `.htaccess`
4. Minimize API calls on page load

### Deployment Troubleshooting

**CSP Errors in Console**

If you see "violates Content Security Policy" errors:

1. Check the error message for the blocked URL
2. Add the domain to `connect-src` in `frontend-react/public/.htaccess`
3. Rebuild: `npm run build`
4. Redeploy: `rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/`

**API Connection Errors**

If the app can't connect to the API:

1. Verify the API endpoint is correct
   ```bash
   curl -I https://www.bahar.co.il/fantasybroker-api/api/health
   ```

2. Check that the API server is running
   ```bash
   ssh user@server "ps aux | grep node"
   ```

3. Verify CORS headers are set correctly
   ```bash
   curl -I -H "Origin: https://www.bahar.co.il" https://www.bahar.co.il/fantasybroker-api/api/health
   ```

4. Check browser console for detailed error messages

**COOP Errors**

If you see "Cross-Origin-Opener-Policy policy would block the window.postMessage call":

1. This is expected for cross-origin communication
2. The `.htaccess` file includes proper COOP headers
3. Verify `.htaccess` is deployed to the server
4. Check Apache modules are enabled:
   ```bash
   ssh user@server "apache2ctl -M | grep headers"
   ```

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

The project now includes a modern React frontend built with Vite. See below for comprehensive build and deployment instructions.

#### Prerequisites

- Node.js 14+ and npm
- Git
- Access to production server (for deployment)
- Apache with `mod_headers`, `mod_rewrite`, `mod_deflate` modules

#### Build for Production

**Step 1: Install dependencies**

```bash
cd frontend-react
npm install
```

**Step 2: Build the production bundle**

```bash
npm run build
```

This creates an optimized production build in the `react/` folder:
- `react/index.html` - Main HTML entry point
- `react/assets/index-*.css` - Minified CSS (~5.35KB gzipped)
- `react/assets/index-*.js` - Minified JavaScript (~215.3KB gzipped)
- `react/.htaccess` - Apache configuration with security headers

**Step 3: Verify the build**

```bash
# Check that build completed successfully
ls -lah react/
# Should show: index.html, assets/, .htaccess, vite.svg
```

#### Deploy to Production

**Option 1: Using rsync (recommended)**

```bash
# From project root directory
rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/

# Verify deployment
ssh user@server "ls -lah /var/www/fantasy-broker/react/"
```

**Option 2: Using SFTP**

1. Connect to server via SFTP client (e.g., FileZilla, Cyberduck)
2. Navigate to `/var/www/fantasy-broker/`
3. Upload entire `react/` folder contents
4. Verify all files are present

**Option 3: Using Git on server**

```bash
# On server
cd /var/www/fantasy-broker
git clone <repo-url> portfolio-tracker
cd portfolio-tracker/frontend-react
npm install
npm run build
# Built files are now in ../react/
```

**Step 4: Set permissions**

```bash
ssh user@server "chmod -R 755 /var/www/fantasy-broker/react/ && chmod -R 644 /var/www/fantasy-broker/react/assets/*"
```

#### Verify Deployment

**Checklist:**

1. **Open the app**
   ```
   https://www.bahar.co.il/fantasybroker/react/
   ```

2. **Check console for errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Should show NO errors (warnings are OK)

3. **Verify page loads**
   - Login page should display
   - Google Sign-In button should be visible
   - Demo Mode button should be visible

4. **Test authentication**
   - Click "Continue in Demo Mode"
   - Should redirect to dashboard
   - Portfolio data should load

5. **Check API connectivity**
   - Open Network tab (F12)
   - Navigate to dashboard
   - Should see successful API calls (200 status)
   - No 403 or 401 errors

6. **Test theme toggle**
   - Click theme toggle button (Sun/Moon icon)
   - Theme should change immediately
   - Refresh page - theme should persist

7. **Test user profile**
   - User name should display in header
   - Avatar should show (image or initials)
   - Admin badge should show if admin user
   - Logout button should work

#### Environment Configuration

The React app automatically detects the environment based on hostname:

- **Production** (`www.bahar.co.il`): Uses `https://www.bahar.co.il/fantasybroker-api/api`
- **Development** (`localhost`): Uses `http://localhost:4000/api`

**To override environment settings:**

Create `.env.production` in `frontend-react/`:

```env
VITE_API_URL=https://your-api-endpoint/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Then rebuild:

```bash
npm run build
```

#### Local Development

**Start development server:**

```bash
cd frontend-react
npm install
npm run dev
```

**Access the app:**

```
http://localhost:5173/
```

**Note:** The development server uses `base: '/'` to avoid OAuth origin mismatches. Production uses `base: '/fantasybroker/react/'`.

**Features:**
- Hot module replacement (HMR) - changes reflect instantly
- Source maps - easier debugging
- TypeScript checking - catches errors before build

#### Google OAuth Setup for Localhost Development

To test Google Sign-In on localhost, you need to configure Google Cloud Console:

**Step 1: Add localhost origin to Google Cloud Console**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Add to **Authorized JavaScript origins**:
   - `http://localhost:5173`
6. Add to **Authorized redirect URIs**:
   - `http://localhost:5173/login`
   - `http://localhost:5173/`
   - `http://localhost:5173/fantasybroker/react/login` (for production compatibility)
7. Click Save

**Step 2: Wait for propagation**

Google's security settings can take 10-30 minutes to propagate. Wait before testing.

**Step 3: Test Google Sign-In**

1. Start the dev server: `npm run dev`
2. Open `http://localhost:5173/login`
3. Click "Google" button
4. You should see the Google One Tap prompt
5. Sign in with your Google account

**Troubleshooting:**

- **"The given origin is not allowed for the given client ID"**:
  - Verify you added `http://localhost:5173` (without path) to Authorized JavaScript origins
  - Wait 10-30 minutes for Google to propagate changes
  - Try incognito mode to clear browser cache

- **"Not signed in with the identity provider"**:
  - This is expected on HTTP localhost (FedCM is disabled)
  - The app uses One Tap method instead
  - This is normal and secure for development

**Note:** FedCM (Federated Credential Management) is disabled on localhost development to avoid strict HTTPS requirements. Production uses FedCM for enhanced security.

#### Production Build & Deployment

**Build for production:**

```bash
cd frontend-react
npm run build
```

This creates an optimized production build in the `react/` directory with:
- Minified JavaScript and CSS
- Source maps disabled (security)
- Tree-shaking enabled
- Code splitting for routes
- Gzip compression ready

**Deploy to production server:**

```bash
# Option 1: Using rsync (recommended)
rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/

# Option 2: Using SCP
scp -r react/* user@server:/var/www/fantasy-broker/react/

# Option 3: Using Git
ssh user@server "cd /var/www/fantasy-broker && git pull origin main && npm run build"
```

**Verify deployment:**

```bash
# Check that files are deployed
ssh user@server "ls -la /var/www/fantasy-broker/react/"

# Test API connectivity
curl -I https://www.bahar.co.il/fantasybroker-api/api/health

# Check that app loads
curl -I https://www.bahar.co.il/fantasybroker/react/
```

**Post-deployment checklist:**

- [ ] Verify app loads at `https://www.bahar.co.il/fantasybroker/react/`
- [ ] Check browser console for errors (F12)
- [ ] Test login with Google OAuth
- [ ] Test demo mode login
- [ ] Verify API calls are working (Network tab)
- [ ] Check that debug badge appears/disappears based on `MARKET_DATA_MODE`
- [ ] Test on mobile devices
- [ ] Verify dark mode toggle works
- [ ] Check that all pages load correctly

#### Build Troubleshooting

**Build fails with TypeScript errors**

```bash
# Check for type errors
cd frontend-react
npm run type-check

# Fix errors and rebuild
npm run build
```

**Build succeeds but app doesn't load**

1. Check that `react/index.html` exists
2. Verify `.htaccess` is in `react/` folder
3. Check Apache error logs: `tail -f /var/log/apache2/error.log`
4. Verify Apache modules are enabled: `a2enmod headers rewrite deflate`

**Build is slow or hangs**

```bash
# Clear cache and rebuild
rm -rf frontend-react/node_modules frontend-react/.vite
npm install
npm run build
```

#### Environment Variables for Production

**Frontend environment variables** (set in `frontend-react/.env`):

```bash
# API endpoint - automatically detected from hostname in production
# For local development, set explicitly:
VITE_API_URL=http://localhost:3000

# Google OAuth Client ID - required for Google Sign-In
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

**Backend environment variables** (set in `backend/.env`):

```bash
# Server configuration
PORT=3000
NODE_ENV=production

# Database configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=portfolio_user
DB_PASSWORD=secure_password_here
DB_NAME=portfolio_tracker

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# Market data mode
# 'production' - Normal behavior: 15-minute cache TTL, calls Finnhub when cache expires
# 'debug' - Testing mode: Infinite cache, only first call per symbol hits Finnhub (throttles API usage)
MARKET_DATA_MODE=production

# Finnhub API key
FINNHUB_API_KEY=your-finnhub-api-key-here

# JWT secret for token signing
JWT_SECRET=your-secure-jwt-secret-here

# CORS configuration
CORS_ORIGIN=https://www.bahar.co.il
```

**Important security notes:**

- Never commit `.env` files to version control
- Use strong, unique passwords for database
- Rotate JWT_SECRET regularly
- Use HTTPS in production
- Keep API keys secure and rotate them periodically
- Use environment-specific configurations

#### Deployment Troubleshooting

**CSP Errors in Console**

If you see "violates Content Security Policy" errors:

1. Check the error message for the blocked URL
2. Add the domain to `connect-src` in `frontend-react/public/.htaccess`
3. Rebuild: `npm run build`
4. Redeploy: `rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/`

Example CSP error:
```
Refused to connect to 'https://example.com/api' because it violates the Content Security Policy directive: "connect-src 'self' https://www.bahar.co.il/fantasybroker-api/"
```

Fix:
```apache
# In frontend-react/public/.htaccess
Header set Content-Security-Policy "connect-src 'self' https://www.bahar.co.il/fantasybroker-api/ https://example.com/api"
```

**API Connection Errors**

If the app can't connect to the API:

1. Verify the API endpoint is correct
   ```bash
   curl -I https://www.bahar.co.il/fantasybroker-api/api/health
   ```

2. Check that the API server is running
   ```bash
   ssh user@server "ps aux | grep node"
   ```

3. Verify CORS headers are set correctly
   ```bash
   curl -I -H "Origin: https://www.bahar.co.il" https://www.bahar.co.il/fantasybroker-api/api/health
   ```

4. Check browser console for detailed error messages

**COOP Errors**

If you see "Cross-Origin-Opener-Policy policy would block the window.postMessage call":

1. This is expected for cross-origin communication
2. The `.htaccess` file includes proper COOP headers
3. Verify `.htaccess` is deployed to the server
4. Check Apache modules are enabled:
   ```bash
   ssh user@server "apache2ctl -M | grep headers"
   ```

**Blank page or 404 errors**

1. Verify `react/index.html` exists on server
2. Check Apache configuration for correct document root
3. Verify `.htaccess` is in `react/` folder
4. Check Apache error logs for rewrite errors
5. Verify base path in `vite.config.ts` matches deployment path

#### Performance Optimization

**Current build metrics:**
- JavaScript: 739.64KB (215.30KB gzipped)
- CSS: 25.43KB (5.35KB gzipped)
- Total modules: 2457
- Build time: ~3.91s

**To reduce bundle size:**

1. Use dynamic imports for large components
2. Remove unused dependencies
3. Enable tree-shaking in `vite.config.ts`
4. Consider code splitting for routes

**To improve load time:**

1. Enable gzip compression in Apache
2. Use CDN for static assets
3. Enable browser caching with `.htaccess`
4. Minimize API calls on page load

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


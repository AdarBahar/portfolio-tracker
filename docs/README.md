# Portfolio Tracker Backend

Node.js + Express + MySQL backend API for the Portfolio Tracker application.

## Features

- 🔐 **Google OAuth Authentication** - Secure user authentication with Google Sign-In
- 📊 **Portfolio Management** - Holdings, dividends, and transactions
- 🎮 **Trade Room (Bull Pen)** - Fantasy trading competitions with real-time leaderboards
- 📈 **Real-time Market Data** - Live stock prices from Finnhub API
- 🔄 **Background Jobs** - Automated room state management and leaderboard updates
- 📝 **OpenAPI/Swagger** - Complete API documentation
- ✅ **Smoke Tests** - Comprehensive API testing suite

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ or MariaDB 10.5+
- Finnhub API key (free tier available)

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env` file:**
   ```bash
   # Server
   PORT=4000

   # MySQL database
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=portfolio_tracker

   # Auth
   JWT_SECRET=your_random_secret_here
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

   # Market Data API
   FINNHUB_API_KEY=your_finnhub_api_key_here
   ```

4. **Set up database:**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE portfolio_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

   # Import schema
   mysql -u root -p portfolio_tracker < ../schema.mysql.sql
   ```

5. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

6. **Verify it's running:**
   ```bash
   curl http://localhost:4000/api/health
   # Should return: {"status":"ok","db":"ok"}
   ```

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `portfolio_tracker` |
| `JWT_SECRET` | Secret for JWT signing | `random_string_here` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123...apps.googleusercontent.com` |
| `FINNHUB_API_KEY` | Finnhub API key | `your_api_key` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `DB_PORT` | MySQL port | `3306` |

## Getting API Keys

### Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:8000` (development)
   - `https://yourdomain.com` (production)
7. Copy the Client ID

See `../GOOGLE_OAUTH_SETUP.md` for detailed instructions.

### Finnhub API Key

1. Go to [Finnhub.io](https://finnhub.io/)
2. Sign up for a free account
3. Go to [Dashboard](https://finnhub.io/dashboard)
4. Copy your API key from the dashboard

**Free tier limits:**
- 60 API calls per minute
- Real-time stock quotes
- Company profiles
- No credit card required

**Why Finnhub?**
- Better rate limits than Alpha Vantage (60/min vs 5/min)
- Real-time data access
- Simple REST API
- Free tier sufficient for development

## API Documentation

### Swagger UI

Once the server is running, visit:
```
http://localhost:4000/api-docs
```

### OpenAPI Spec

```
http://localhost:4000/api/openapi.json
```





## Key Endpoints

### Authentication
- `POST /api/auth/google` - Authenticate with Google ID token

### Portfolio Management
- `GET /api/holdings` - List user's holdings
- `POST /api/holdings` - Create new holding
- `PUT /api/holdings/:id` - Update holding
- `DELETE /api/holdings/:id` - Delete holding
- `GET /api/dividends` - List dividends
- `GET /api/transactions` - List transactions
- `GET /api/portfolio/all` - Get complete portfolio

### Market Data (NEW)
- `GET /api/market-data/:symbol` - Get real-time price for a stock
- `GET /api/market-data?symbols=AAPL,GOOGL` - Get prices for multiple stocks

### Trade Room (Bull Pen)
- `POST /api/bull-pens` - Create a trading room
- `GET /api/bull-pens` - List available rooms
- `GET /api/bull-pens/:id` - Get room details
- `POST /api/bull-pens/:id/join` - Join a room
- `POST /api/bull-pens/:id/orders` - Place an order
- `GET /api/bull-pens/:id/orders` - List orders
- `GET /api/bull-pens/:id/positions` - List positions
- `GET /api/bull-pens/:id/leaderboard` - Get current rankings

## Testing

### Run Smoke Tests

```bash
# Test local server
node apiSmokeTest.js --base-url=http://localhost:4000

# Test production
node apiSmokeTest.js --base-url=https://yourdomain.com/api

# With Google credentials (for authenticated tests)
node apiSmokeTest.js --base-url=http://localhost:4000 --google-credential=YOUR_GOOGLE_JWT

# List all available tests
node apiSmokeTest.js --list
```

### Test Finnhub Integration

```bash
# Test single symbol
node test-finnhub.js AAPL

# Test different symbols
node test-finnhub.js TSLA
node test-finnhub.js GOOGL
```

## Background Jobs

The server runs two background jobs:

### 1. Room State Manager (every minute)
- Transitions rooms from `scheduled` → `active` at start time
- Transitions rooms from `active` → `completed` after duration
- Creates final leaderboard snapshot when room completes

### 2. Leaderboard Updater (every 5 minutes)
- Updates leaderboard snapshots for all active rooms
- Calculates portfolio values using real-time market data
- Computes P&L metrics and rankings

**Note:** Jobs only start if database tables exist. See `PHASE3_PRODUCTION_FIX.md` for details.

## Database Schema

The application uses the following main tables:

### Core Tables
- `users` - User accounts (Google OAuth)
- `holdings` - User stock holdings
- `dividends` - Dividend records
- `transactions` - Transaction history

### Trade Room Tables
- `bull_pens` - Trading rooms/competitions
- `bull_pen_memberships` - Room participants
- `bull_pen_orders` - Order history
- `bull_pen_positions` - Current positions in rooms
- `market_data` - Cached stock prices (15-min TTL)
- `leaderboard_snapshots` - Historical rankings

See `../schema.mysql.sql` for complete schema.

## Project Structure

```
backend/
├── src/
│   ├── app.js                          # Express app setup
│   ├── server.js                       # Server entry point
│   ├── db.js                           # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js           # Google OAuth
│   │   ├── holdingsController.js       # Holdings CRUD
│   │   ├── dividendsController.js      # Dividends CRUD
│   │   ├── transactionsController.js   # Transactions CRUD
│   │   ├── portfolioController.js      # Portfolio aggregation
│   │   ├── bullPensController.js       # Bull pen management
│   │   ├── bullPenMembershipsController.js  # Membership management
│   │   ├── bullPenOrdersController.js  # Order execution
│   │   ├── marketDataController.js     # Finnhub integration
│   │   └── leaderboardController.js    # Leaderboard calculations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── holdingsRoutes.js
│   │   ├── dividendsRoutes.js
│   │   ├── transactionsRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── bullPenRoutes.js
│   │   ├── bullPenMembershipsRoutes.js
│   │   ├── bullPenOrdersRoutes.js
│   │   ├── marketDataRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── jobs/
│   │   └── index.js                    # Background jobs (cron)
│   └── utils/
│       ├── apiError.js                 # Error response helpers
│       └── authenticateToken.js        # JWT middleware
├── openapi.json                        # OpenAPI 3.0 spec
├── apiSmokeTest.js                     # API test suite
├── test-finnhub.js                     # Finnhub integration test
├── package.json
└── .env.example                        # Environment template
```

## Deployment

See `PROD_DEPLOYMENT_INMOTION.md` for production deployment guide.

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with:
- `src/` - All source files
- `openapi.json` - API documentation
- `package.json` - Dependencies
- `.env.example` - Environment template

### Production Checklist

- [ ] Set strong `JWT_SECRET` (random 32+ characters)
- [ ] Configure production database credentials
- [ ] Add production domain to Google OAuth authorized origins
- [ ] Set `FINNHUB_API_KEY` environment variable
- [ ] Run database migrations (`schema.mysql.sql`)
- [ ] Test with smoke tests
- [ ] Monitor API rate limits (Finnhub: 60/min)

## Troubleshooting

### Server won't start

**Check database connection:**
```bash
mysql -u your_user -p -h localhost portfolio_tracker -e "SELECT 1;"
```

**Check environment variables:**
```bash
node -e "require('dotenv').config(); console.log(process.env.DB_HOST);"
```

### Background jobs not starting

**Verify tables exist:**
```bash
mysql -u your_user -p portfolio_tracker -e "SHOW TABLES LIKE 'market_data';"
mysql -u your_user -p portfolio_tracker -e "SHOW TABLES LIKE 'leaderboard_snapshots';"
```

If tables are missing, run migrations:
```bash
mysql -u your_user -p portfolio_tracker < ../schema.mysql.sql
```

### Market data returns stub prices

**Check Finnhub API key:**
```bash
node test-finnhub.js AAPL
```

If it fails, verify `FINNHUB_API_KEY` in `.env` is correct.

### 401 Unauthorized errors

**Verify Google Client ID:**
- Check `GOOGLE_CLIENT_ID` in `.env` matches your Google Cloud Console
- Ensure authorized origins include your domain
- Test with: `node apiSmokeTest.js --google-credential=YOUR_JWT`

## Documentation

- `API_TESTS.md` - Smoke test documentation
- `BUILD.md` - Build process guide
- `PHASE3_PRODUCTION_FIX.md` - Production deployment fix
- `PROD_DEPLOYMENT_INMOTION.md` - InMotion hosting guide
- `TEST_MODULE.md` - Testing module documentation

## License

MIT License - see root LICENSE file

## Support

For issues or questions, please open an issue on GitHub.

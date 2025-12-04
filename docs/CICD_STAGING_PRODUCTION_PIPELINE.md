# CI/CD Pipeline: Staging → Production

## Overview

This document describes the CI/CD pipeline for deploying the Portfolio Tracker application from development to staging to production.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Git Repository                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   develop    │  │     main     │  │   releases   │      │
│  │   branch     │  │    branch    │  │    branch    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   Staging    │  │  Production  │  │   Hotfix     │
    │ Environment  │  │ Environment  │  │ Environment  │
    └──────────────┘  └──────────────┘  └──────────────┘
```

## Branch Strategy

### develop
- **Purpose**: Integration branch for features
- **Deployment**: Automatic to staging
- **Trigger**: Push to develop branch
- **Tests**: Unit, integration, E2E tests

### main
- **Purpose**: Production-ready code
- **Deployment**: Manual to production (after staging verification)
- **Trigger**: Manual approval or merge from develop
- **Tests**: All tests + smoke tests

### releases/*
- **Purpose**: Release preparation
- **Deployment**: Manual to production
- **Trigger**: Manual approval
- **Tests**: All tests + performance tests

## Staging Deployment Pipeline

### Trigger
- Push to `develop` branch
- Manual trigger via GitHub Actions

### Steps
1. **Checkout Code**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Build Frontend**
   ```bash
   cd frontend-react
   npm ci
   npm run build
   ```

3. **Build Backend**
   ```bash
   cd backend
   npm ci
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

5. **Deploy to Staging**
   ```bash
   ./scripts/deploy-staging.sh
   ```

6. **Run Smoke Tests**
   ```bash
   npm run test:smoke:staging
   ```

7. **Notify Team**
   - Send Slack notification with staging URL
   - Include test results and deployment status

## Production Deployment Pipeline

### Trigger
- Manual approval in GitHub Actions
- Or merge to `main` branch with auto-deploy enabled

### Steps
1. **Checkout Code**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Build Frontend**
   ```bash
   cd frontend-react
   npm ci
   npm run build
   ```

3. **Build Backend**
   ```bash
   cd backend
   npm ci
   npm run build
   ```

4. **Run All Tests**
   ```bash
   npm test
   npm run lint
   npm run type-check
   npm run test:e2e
   ```

5. **Create Backup**
   ```bash
   ./scripts/backup-production.sh
   ```

6. **Deploy to Production**
   ```bash
   ./scripts/deploy-production.sh
   ```

7. **Run Smoke Tests**
   ```bash
   npm run test:smoke:production
   ```

8. **Verify Deployment**
   - Check frontend loads
   - Check backend API responds
   - Check database connectivity
   - Check WebSocket connection

9. **Notify Team**
   - Send Slack notification with deployment status
   - Include rollback instructions if needed

## GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Staging/Production

on:
  push:
    branches:
      - develop
      - main
  workflow_dispatch:

jobs:
  staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build Frontend
        run: |
          cd frontend-react
          npm ci
          npm run build
      
      - name: Build Backend
        run: |
          cd backend
          npm ci
      
      - name: Run Tests
        run: npm test
      
      - name: Deploy to Staging
        run: ./scripts/deploy-staging.sh
        env:
          STAGING_HOST: ${{ secrets.STAGING_HOST }}
          STAGING_USER: ${{ secrets.STAGING_USER }}
          STAGING_KEY: ${{ secrets.STAGING_KEY }}
      
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Staging deployment completed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ Staging deployment successful\n<https://www.bahar.co.il/fantasybroker-staging|View Staging>"
                  }
                }
              ]
            }

  production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build Frontend
        run: |
          cd frontend-react
          npm ci
          npm run build
      
      - name: Build Backend
        run: |
          cd backend
          npm ci
      
      - name: Run All Tests
        run: npm test
      
      - name: Create Backup
        run: ./scripts/backup-production.sh
        env:
          PROD_HOST: ${{ secrets.PROD_HOST }}
          PROD_USER: ${{ secrets.PROD_USER }}
          PROD_KEY: ${{ secrets.PROD_KEY }}
      
      - name: Deploy to Production
        run: ./scripts/deploy-production.sh
        env:
          PROD_HOST: ${{ secrets.PROD_HOST }}
          PROD_USER: ${{ secrets.PROD_USER }}
          PROD_KEY: ${{ secrets.PROD_KEY }}
      
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Production deployment completed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "✅ Production deployment successful\n<https://www.bahar.co.il/fantasybroker|View Production>"
                  }
                }
              ]
            }
```

## Rollback Procedure

### Staging Rollback
```bash
cd /home/user/portfolio-tracker
git checkout develop~1
./scripts/deploy-staging.sh
```

### Production Rollback
```bash
cd /home/user/portfolio-tracker
git checkout main~1
./scripts/deploy-production.sh
```

## Monitoring & Alerts

### Staging Monitoring
- Check frontend loads: `curl https://www.bahar.co.il/fantasybroker-staging`
- Check backend API: `curl https://www.bahar.co.il/fantasybroker-api-staging/api/health`
- Check database: Monitor query performance
- Check WebSocket: Monitor connection count

### Production Monitoring
- Same as staging, but with production URLs
- Set up alerts for:
  - API response time > 1s
  - Error rate > 1%
  - Database connection failures
  - WebSocket connection drops

## Secrets Management

Store these secrets in GitHub Actions:
- `STAGING_HOST`: Staging server hostname
- `STAGING_USER`: SSH user for staging
- `STAGING_KEY`: SSH private key for staging
- `PROD_HOST`: Production server hostname
- `PROD_USER`: SSH user for production
- `PROD_KEY`: SSH private key for production
- `SLACK_WEBHOOK`: Slack webhook for notifications

## Testing Strategy

### Unit Tests
- Run on every commit
- Coverage: >80%
- Tools: Jest, Vitest

### Integration Tests
- Run on every commit
- Coverage: API endpoints, database operations
- Tools: Jest, Supertest

### E2E Tests
- Run on staging before production
- Coverage: User workflows, critical paths
- Tools: Playwright, Cypress

### Smoke Tests
- Run after deployment
- Coverage: Basic functionality
- Tools: Custom scripts, curl

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations prepared
- [ ] Environment variables configured
- [ ] Backup created (production only)

### Deployment
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Database migrations run
- [ ] Services restarted
- [ ] Health checks passing

### Post-Deployment
- [ ] Smoke tests passing
- [ ] Team notified
- [ ] Monitoring alerts active
- [ ] Rollback plan ready
- [ ] Documentation updated

## Next Steps

1. Set up GitHub Actions workflows
2. Configure secrets in GitHub
3. Test staging deployment
4. Test production deployment
5. Set up monitoring and alerts
6. Document team procedures


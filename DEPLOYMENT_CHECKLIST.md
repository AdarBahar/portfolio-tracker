# Production Deployment Checklist

## Pre-Deployment (Local)

### Backend
- [ ] Run `npm run build` - no errors
- [ ] Run `npm test` - all tests pass
- [ ] Check `.env.production` configured
- [ ] Verify database credentials
- [ ] Verify JWT secret set
- [ ] Verify CORS origin set
- [ ] Check WebSocket port 4001 available
- [ ] Review recent commits
- [ ] Tag release: `git tag v3.3.0`

### Frontend
- [ ] Run `npm run build` - no errors
- [ ] Run `npm run type-check` - no errors
- [ ] Check `.env.production` configured
- [ ] Verify API URL correct
- [ ] Verify Google Client ID set
- [ ] Check build output in `react/` directory
- [ ] Verify bundle size acceptable
- [ ] Review recent commits

### Code Quality
- [ ] No console errors in dev
- [ ] No React warnings in dev
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security audit passed

## Deployment (Production)

### Backend Deployment
- [ ] SSH into production server
- [ ] Navigate to `/var/www/fantasybroker-api`
- [ ] Deploy using rsync/SCP/Git
- [ ] Copy `.env.production` file
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Start backend: `pm2 start dist/src/server.js`
- [ ] Verify process running: `pm2 status`
- [ ] Check logs: `pm2 logs portfolio-backend`

### Frontend Deployment
- [ ] Navigate to `/var/www/fantasybroker/react`
- [ ] Deploy using rsync/SCP/Git
- [ ] Verify file permissions
- [ ] Clear web server cache
- [ ] Verify index.html present
- [ ] Verify assets directory present

### Database
- [ ] Verify database connection
- [ ] Check all tables exist
- [ ] Verify schema up to date
- [ ] Check data integrity
- [ ] Backup database before deployment

## Post-Deployment Verification

### Backend
- [ ] REST API responding: `curl https://www.bahar.co.il/fantasybroker-api/api/health`
- [ ] WebSocket server running: `lsof -i :4001`
- [ ] Database connected
- [ ] No errors in logs
- [ ] Process memory usage normal
- [ ] CPU usage normal

### Frontend
- [ ] Page loads: `https://www.bahar.co.il/fantasybroker/react/`
- [ ] No console errors (F12)
- [ ] No React warnings
- [ ] Assets loading correctly
- [ ] CSS styling correct
- [ ] Responsive design works

### Functionality
- [ ] Login works
- [ ] Google Sign-In works
- [ ] Dashboard loads
- [ ] Trade Room loads
- [ ] Can create room
- [ ] Can join room
- [ ] Can place order
- [ ] Real-time updates work
- [ ] Leaderboard updates
- [ ] Position tracking works
- [ ] WebSocket connection established

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] WebSocket latency < 100ms
- [ ] No memory leaks
- [ ] No connection timeouts
- [ ] Concurrent users working

### Security
- [ ] HTTPS working
- [ ] CSP headers set
- [ ] CORS configured correctly
- [ ] JWT validation working
- [ ] No sensitive data in logs
- [ ] No security warnings

## Monitoring Setup

- [ ] Error tracking configured (Sentry/etc)
- [ ] Performance monitoring configured
- [ ] WebSocket connection monitoring
- [ ] Database monitoring
- [ ] Server resource monitoring
- [ ] Alerts configured
- [ ] Log aggregation configured

## Rollback Plan

- [ ] Previous version tagged
- [ ] Rollback procedure documented
- [ ] Database backup available
- [ ] Rollback tested (optional)
- [ ] Team notified of rollback plan

## Communication

- [ ] Team notified of deployment
- [ ] Users notified of maintenance (if needed)
- [ ] Support team briefed
- [ ] Deployment time scheduled
- [ ] Rollback contact identified

## Post-Deployment

- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Check error logs
- [ ] Verify performance metrics
- [ ] Document any issues
- [ ] Plan next deployment

## Sign-Off

- [ ] QA Lead: _________________ Date: _______
- [ ] Dev Lead: ________________ Date: _______
- [ ] DevOps Lead: _____________ Date: _______
- [ ] Product Owner: ___________ Date: _______

## Deployment Details

**Deployment Date**: _______________
**Deployed By**: ___________________
**Version**: ______________________
**Commit Hash**: ___________________
**Duration**: ______________________
**Issues**: ________________________

## Notes

```
[Space for deployment notes]
```


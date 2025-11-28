# React Deployment Checklist

## Pre-Deployment

- [ ] All React components tested locally
- [ ] API endpoints verified working
- [ ] Environment variables configured
- [ ] `.env` file updated with production API URL
- [ ] Build completes without errors: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors in dev mode

## Build Verification

- [ ] `react/` folder exists with build output
- [ ] `react/index.html` exists
- [ ] `react/assets/` folder contains CSS and JS files
- [ ] `react/.htaccess` exists
- [ ] `react/.env` configured correctly

## Deployment Steps

- [ ] Backup current vanilla JS files
- [ ] Deploy React build to production:
  ```bash
  rsync -avz --delete react/ user@server:/var/www/fantasy-broker/react/
  ```
- [ ] Verify files on server:
  ```bash
  ls -la /var/www/fantasy-broker/react/
  ls -la /var/www/fantasy-broker/react/assets/
  ```
- [ ] Set correct permissions:
  ```bash
  chmod -R 755 /var/www/fantasy-broker/react/
  chmod -R 644 /var/www/fantasy-broker/react/assets/*
  chmod 644 /var/www/fantasy-broker/react/index.html
  chmod 644 /var/www/fantasy-broker/react/.htaccess
  ```

## Post-Deployment Testing

### URL Tests
- [ ] Root path loads: `https://www.bahar.co.il/fantasybroker/react/`
- [ ] Dashboard loads: `https://www.bahar.co.il/fantasybroker/react/dashboard`
- [ ] Trade Room loads: `https://www.bahar.co.il/fantasybroker/react/trade-room`
- [ ] Admin loads: `https://www.bahar.co.il/fantasybroker/react/admin`
- [ ] 404 page shows for invalid routes

### Asset Tests
- [ ] CSS loads correctly (no MIME type errors)
- [ ] JavaScript loads correctly
- [ ] Images/SVG load correctly
- [ ] No 404 errors in console

### API Tests
- [ ] API calls succeed
- [ ] Data displays correctly
- [ ] Error handling works
- [ ] Authentication works

### Browser Tests
- [ ] No console errors
- [ ] No CSP violations
- [ ] Responsive design works
- [ ] Navigation works
- [ ] Forms submit correctly

## Switching to React (When Ready)

- [ ] All testing complete and passed
- [ ] Backup vanilla JS files:
  ```bash
  mkdir -p Archive/vanilla-js-backup
  cp index.html login.html admin.html trade-room.html Archive/vanilla-js-backup/
  ```
- [ ] Copy React build to root:
  ```bash
  cp -r react/* .
  ```
- [ ] Update root `.htaccess` for React Router
- [ ] Test all routes work from root
- [ ] Remove vanilla JS files (optional)

## Rollback Plan

If issues occur:

- [ ] Restore vanilla JS files from backup
- [ ] Or restore from git: `git checkout index.html login.html admin.html trade-room.html`
- [ ] Verify vanilla JS frontend works
- [ ] Investigate issues
- [ ] Fix and redeploy React

## Monitoring

- [ ] Monitor error logs for issues
- [ ] Check performance metrics
- [ ] Verify API response times
- [ ] Monitor user feedback
- [ ] Track any bugs or issues


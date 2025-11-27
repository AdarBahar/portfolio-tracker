# Reconciliation Job

## Overview

The reconciliation job runs hourly to verify data integrity across all Phase 3 systems (settlement, rake, bonuses). It checks for inconsistencies and logs issues for investigation.

## Architecture

### Schedule

- **Frequency**: Every hour (0 * * * *)
- **Duration**: ~5-10 seconds
- **Logging**: All results logged to application logs

### Checks Performed

#### 1. Settlement Integrity Check
- Verifies all settled rooms have corresponding settlement budget logs
- Checks for missing correlation IDs
- Identifies rooms that were settled but not logged

**Issue Type**: `MISSING_SETTLEMENT_LOGS`

#### 2. Rake Collection Check
- Verifies all settled rooms have rake collection records
- Checks that rake was deducted from pool
- Identifies rooms missing rake collection

**Issue Type**: `MISSING_RAKE_COLLECTION`

#### 3. Budget Logs Consistency Check
- Verifies all settlement budget logs have correlation IDs
- Checks for invalid amounts (≤ 0)
- Identifies orphaned or malformed logs

**Issue Types**: 
- `MISSING_CORRELATION_ID`
- `INVALID_AMOUNT`

#### 4. Bonus Redemptions Check
- Verifies all bonus redemptions have corresponding budget logs
- Checks that bonuses were credited to user budgets
- Identifies missing or orphaned redemptions

**Issue Type**: `MISSING_BONUS_BUDGET_LOG`

## Implementation

### File Location
`backend/src/jobs/reconciliationJob.js`

### Functions

**`reconciliationJob()`**
- Main entry point
- Runs all checks
- Aggregates results
- Logs summary

**`checkSettlementIntegrity()`**
- Finds settled rooms without settlement logs
- Returns count and room IDs

**`checkRakeCollection()`**
- Finds settled rooms without rake collection
- Returns count and room IDs

**`checkBudgetLogs()`**
- Finds budget logs with missing correlation IDs
- Finds budget logs with invalid amounts
- Returns counts

**`checkBonusRedemptions()`**
- Finds bonus redemptions without budget logs
- Returns count

## Output Format

```json
{
  "timestamp": "2025-11-27T10:00:00Z",
  "checks": {
    "settlement_integrity": {
      "issues": [],
      "checked": 42
    },
    "rake_collection": {
      "issues": [],
      "checked": 42
    },
    "budget_logs": {
      "issues": [],
      "checked": 156
    },
    "bonus_redemptions": {
      "issues": [],
      "checked": 23
    }
  },
  "issues": []
}
```

## Log Examples

### Success
```
[Reconciliation] Starting reconciliation job
[Reconciliation] ✓ All checks passed
```

### With Issues
```
[Reconciliation] Starting reconciliation job
[Reconciliation] ⚠ Found 2 issues:
  - MISSING_SETTLEMENT_LOGS: 1 room
  - MISSING_RAKE_COLLECTION: 1 room
```

## Integration

### Scheduled in `backend/src/jobs/index.js`

```javascript
// Reconciliation job - every hour
cron.schedule('0 * * * *', reconciliationJob);
logger.log('[Jobs] Scheduled reconciliation job (every hour)');
```

### Exported from `backend/src/jobs/index.js`

```javascript
module.exports = {
  startJobs,
  roomStateManager,
  leaderboardUpdater,
  createLeaderboardSnapshot,
  reconciliationJob,
};
```

## Monitoring

### What to Monitor

1. **Reconciliation Failures**: Job throws error
2. **Data Inconsistencies**: Issues array is not empty
3. **Performance**: Job takes > 30 seconds

### Alert Conditions

- ❌ **CRITICAL**: Settlement integrity issues (rooms settled but not logged)
- ❌ **CRITICAL**: Rake collection issues (rake not collected)
- ⚠️ **WARNING**: Budget log inconsistencies
- ⚠️ **WARNING**: Bonus redemption issues

## Recovery Procedures

### Missing Settlement Logs

1. Identify affected room ID from issue
2. Check if settlement was actually executed
3. If not, manually trigger settlement:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer <internal-token>" \
     http://localhost:4000/internal/v1/settlement/rooms/{id}
   ```
4. Verify settlement logs created

### Missing Rake Collection

1. Identify affected room ID
2. Check rake_config is active
3. Manually trigger settlement (rake collected during settlement)
4. Verify rake_collection table

### Budget Log Inconsistencies

1. Identify affected budget logs
2. Check corresponding room events
3. If orphaned, investigate root cause
4. Consider manual correction if needed

### Bonus Redemption Issues

1. Identify affected bonus redemption
2. Check if budget was credited
3. If not, manually credit via budget service
4. Verify budget_logs created

## Performance Considerations

- Queries use indexes on user_id, promotion_id, correlation_id
- Limits results to 10 per check to avoid large result sets
- Runs hourly to balance coverage vs. performance
- Can be run manually for immediate verification

## Manual Execution

```javascript
const { reconciliationJob } = require('./src/jobs/reconciliationJob');

// Run manually
reconciliationJob().then(results => {
  console.log(JSON.stringify(results, null, 2));
});
```

## Future Enhancements

1. **Alerting**: Send alerts for critical issues
2. **Auto-Recovery**: Automatically fix certain issues
3. **Dashboard**: Real-time reconciliation status
4. **Detailed Reports**: Export reconciliation reports
5. **Configurable Checks**: Enable/disable specific checks
6. **Retention Policy**: Archive old reconciliation results


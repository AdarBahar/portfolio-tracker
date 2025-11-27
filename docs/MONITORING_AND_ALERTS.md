# Monitoring and Alerts Guide

## Overview

Comprehensive monitoring strategy for Phase 3 systems: settlement, rake, bonuses, and reconciliation.

## Key Metrics to Monitor

### Settlement System

**Metrics:**
- Settlement success rate (%)
- Settlement latency (seconds)
- Failed settlements (count)
- Rooms pending settlement (count)

**Thresholds:**
- ❌ Success rate < 95% → CRITICAL
- ⚠️ Latency > 30 seconds → WARNING
- ❌ Failed settlements > 5 → CRITICAL
- ⚠️ Pending > 10 → WARNING

### Rake Collection

**Metrics:**
- Rake collected per hour (VUSD)
- Rake collection success rate (%)
- Average rake percentage (%)
- Rake collection latency (ms)

**Thresholds:**
- ❌ Success rate < 99% → CRITICAL
- ⚠️ Latency > 5 seconds → WARNING
- ⚠️ Rake percentage deviation > 1% → WARNING

### Bonus System

**Metrics:**
- Bonus redemptions per hour (count)
- Redemption success rate (%)
- Failed redemptions (count)
- Promotion usage (%)

**Thresholds:**
- ❌ Success rate < 98% → CRITICAL
- ⚠️ Failed redemptions > 10 → WARNING
- ⚠️ Promotion exhausted → INFO

### Reconciliation Job

**Metrics:**
- Job execution time (seconds)
- Issues found (count)
- Critical issues (count)
- Last successful run (timestamp)

**Thresholds:**
- ❌ Execution time > 60 seconds → WARNING
- ❌ Critical issues > 0 → CRITICAL
- ❌ Last run > 2 hours ago → CRITICAL

## Log Monitoring

### Critical Log Patterns

```
[Settlement] Error settling room
[Rake] Error collecting rake
[Bonus] Error redeeming promotion
[Reconciliation] ⚠ Found issues
[Job] Room settlement failed
```

### Warning Log Patterns

```
[Settlement] Settlement took > 30 seconds
[Rake] Rake collection took > 5 seconds
[Bonus] Promotion exhausted
[Reconciliation] Check failed
```

## Database Monitoring

### Query Performance

Monitor these queries for slow execution:

```sql
-- Settlement queries
SELECT * FROM bull_pens WHERE settlement_status = 'pending';
SELECT * FROM budget_logs WHERE operation_type LIKE 'ROOM_SETTLEMENT%';

-- Rake queries
SELECT * FROM rake_collection WHERE collected_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Bonus queries
SELECT * FROM bonus_redemptions WHERE redeemed_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Table Size Monitoring

Monitor growth of:
- `budget_logs` - Should grow ~100-1000 rows/day
- `rake_collection` - Should grow ~10-100 rows/day
- `bonus_redemptions` - Should grow ~10-100 rows/day

## Alert Configuration

### Slack Integration Example

```javascript
// Send alert to Slack
async function sendAlert(severity, message, details) {
  const color = {
    CRITICAL: '#FF0000',
    WARNING: '#FFA500',
    INFO: '#0000FF'
  }[severity];

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      attachments: [{
        color,
        title: `${severity}: ${message}`,
        text: JSON.stringify(details, null, 2),
        ts: Math.floor(Date.now() / 1000)
      }]
    })
  });
}
```

### Email Alert Example

```javascript
// Send email alert
async function sendEmailAlert(severity, message, details) {
  await emailService.send({
    to: process.env.ALERT_EMAIL,
    subject: `[${severity}] Portfolio Tracker Alert: ${message}`,
    body: `
      Severity: ${severity}
      Message: ${message}
      Details: ${JSON.stringify(details, null, 2)}
      Timestamp: ${new Date().toISOString()}
    `
  });
}
```

## Dashboard Metrics

### Real-time Dashboard

Display:
- Settlement success rate (gauge)
- Rake collected today (counter)
- Bonus redemptions today (counter)
- Reconciliation status (status indicator)
- Recent errors (list)

### Historical Dashboard

Display:
- Settlement success rate (7-day trend)
- Rake collected (7-day trend)
- Bonus redemptions (7-day trend)
- Error rate (7-day trend)

## Health Checks

### Endpoint: GET /health/phase3

```json
{
  "status": "healthy",
  "settlement": {
    "status": "healthy",
    "pending_rooms": 0,
    "failed_settlements": 0,
    "last_settlement": "2025-11-27T10:30:00Z"
  },
  "rake": {
    "status": "healthy",
    "config_active": true,
    "collected_today": 1250.50,
    "last_collection": "2025-11-27T10:30:00Z"
  },
  "bonus": {
    "status": "healthy",
    "active_promotions": 5,
    "redemptions_today": 42,
    "last_redemption": "2025-11-27T10:45:00Z"
  },
  "reconciliation": {
    "status": "healthy",
    "last_run": "2025-11-27T10:00:00Z",
    "issues_found": 0
  }
}
```

## Incident Response

### Settlement Failure

1. Check application logs for error
2. Verify database connectivity
3. Check room state is 'completed'
4. Manually trigger settlement if needed
5. Verify budget logs created
6. Alert team if issue persists

### Rake Collection Failure

1. Check rake_config is active
2. Verify pool size meets min_pool
3. Check database connectivity
4. Manually trigger settlement
5. Verify rake_collection table
6. Alert team if issue persists

### Bonus Redemption Failure

1. Check promotion exists and is active
2. Verify promotion dates are valid
3. Check user eligibility
4. Verify budget service is available
5. Check database connectivity
6. Alert team if issue persists

### Reconciliation Issues

1. Review reconciliation results
2. Identify affected rooms/users
3. Investigate root cause
4. Execute recovery procedure
5. Re-run reconciliation
6. Document incident

## Monitoring Tools

### Recommended Tools

- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **ELK Stack**: Log aggregation and analysis
- **Sentry**: Error tracking
- **PagerDuty**: Incident management
- **Datadog**: APM and monitoring

### Metrics Export

Export metrics in Prometheus format:

```
# HELP settlement_success_total Total successful settlements
# TYPE settlement_success_total counter
settlement_success_total 1234

# HELP settlement_failed_total Total failed settlements
# TYPE settlement_failed_total counter
settlement_failed_total 2

# HELP rake_collected_total Total rake collected
# TYPE rake_collected_total gauge
rake_collected_total 12345.67
```

## Alerting Rules

### Critical Alerts

```yaml
- alert: SettlementFailureRate
  expr: settlement_failed_total / settlement_success_total > 0.05
  for: 5m
  annotations:
    summary: "Settlement failure rate > 5%"

- alert: RakeCollectionFailure
  expr: rake_collection_failed_total > 0
  for: 1m
  annotations:
    summary: "Rake collection failed"

- alert: ReconciliationCriticalIssues
  expr: reconciliation_critical_issues > 0
  for: 1m
  annotations:
    summary: "Reconciliation found critical issues"
```

## Maintenance

### Daily Tasks

- Review error logs
- Check reconciliation results
- Monitor key metrics

### Weekly Tasks

- Review trends
- Check database growth
- Verify backups

### Monthly Tasks

- Review alert thresholds
- Analyze incident reports
- Plan improvements


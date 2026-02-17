# Pure Backend Features

Features that are exclusively server-side and require no frontend changes.

## Database Schema & Models

### Core Voting Tables
- votes table (vote_id, user_id, contestant_id, amount, vote_type, created_at)
- contestants table (contestant_id, event_id, name, slug, category, votes_received, created_at)
- events table (event_id, name, status, start_date, end_date, vote_cap, created_at)
- categories table (category_id, event_id, name, weight, rules)
- vote_ledger table (transaction_id, user_id, timestamp, vote_count, remaining_votes)

### Payment & Transaction Tables
- payments table (payment_id, user_id, amount, status, payment_method, timestamp)
- payment_webhooks table (webhook_id, payment_id, provider, signature, verified_at)
- refunds table (refund_id, payment_id, reason, status, processed_at)
- payment_logs table (log_id, payment_id, event, status_code, response)

### Subscription & Quota Tables
- subscriptions table (subscription_id, user_id, plan_type, start_date, end_date, daily_quota)
- subscription_usage table (usage_id, subscription_id, date, votes_used)
- quota_reset_jobs table (job_id, subscription_id, next_reset_date, status)
- pricing_plans table (plan_id, name, daily_quota, monthly_cost, features)

### Fraud & Security Tables
- fraud_scores table (score_id, user_id, score, risk_level, factors, created_at)
- fraud_flags table (flag_id, vote_id, reason, severity, status)
- ip_velocity table (ip_address, count, window_start, window_end)
- device_fingerprints table (fingerprint_id, user_id, device_hash, first_seen)
- suspicious_patterns table (pattern_id, user_id, pattern_type, detection_time)

### Rate Limiting & Anti-Abuse Tables
- rate_limit_rules table (rule_id, endpoint, limit, window_seconds)
- rate_limit_attempts table (attempt_id, user_id, ip_address, endpoint, timestamp)
- otp_attempts table (otp_id, user_id, attempts, last_attempt_time, locked_until)
- abuse_flags table (flag_id, user_id, flag_type, status, reviewed_at)

### Authentication & User Tables
- users table (user_id, email, phone, password_hash, otp_secret, created_at)
- sessions table (session_id, user_id, jwt_token, expires_at)
- phone_verifications table (verification_id, user_id, phone, otp_code, verified_at)
- password_resets table (reset_id, user_id, token, expires_at)

### Ranking & Scoring Tables
- leaderboard_cache table (rank_id, contestant_id, current_rank, vote_count, updated_at)
- rank_snapshots table (snapshot_id, event_id, timestamp, leaderboard_json)
- score_types table (score_type_id, event_id, name, weight, calculation_method)
- raw_scores table (score_id, contestant_id, score_type_id, value, judge_id, created_at)
- normalized_scores table (normalized_id, contestant_id, final_score, weighted_score)

### Blockchain & Verification Tables
- blockchain_anchors table (anchor_id, event_id, content_hash, tx_hash, chain, timestamp)
- ballot_snapshots table (snapshot_id, event_id, encrypted_json, merkle_root, locked_at)
- vote_hashes table (hash_id, vote_id, vote_hash, inclusion_proof)

### Queue & Async Processing Tables
- vote_queue table (queue_id, vote_id, status, retry_count, next_retry_at)
- batch_jobs table (job_id, job_type, status, created_at, completed_at)
- async_tasks table (task_id, task_type, payload, status, created_at)
- job_results table (result_id, job_id, result_json, error_message)

### Audit & Compliance Tables
- audit_logs table (log_id, user_id, action, resource, timestamp, changes)
- access_logs table (log_id, user_id, endpoint, method, ip_address, timestamp)
- compliance_reports table (report_id, event_id, report_type, data_json, generated_at)

### SaaS & Multi-Tenant Tables
- tenants table (tenant_id, name, domain, status, created_at, plan_type)
- tenant_config table (config_id, tenant_id, setting_key, setting_value)
- tenant_branding table (branding_id, tenant_id, logo_url, color_primary, color_secondary)
- tenant_usage table (usage_id, tenant_id, date, vote_count, payment_count)

### Admin & Moderation Tables
- moderation_queue table (queue_id, content_id, content_type, reason, status)
- admin_actions table (action_id, admin_id, action_type, target_id, timestamp)
- dispute_cases table (dispute_id, payment_id, reason, status, resolution)

## API Endpoints

### Vote Management APIs
- POST /api/votes - Submit a vote (with idempotency key)
- GET /api/votes/{voteId} - Retrieve vote details
- GET /api/votes/user/{userId} - List user's votes
- DELETE /api/votes/{voteId} - Delete/refund a vote
- POST /api/votes/verify - Verify vote integrity

### Leaderboard APIs
- GET /api/leaderboard - Retrieve cached leaderboard
- GET /api/leaderboard/event/{eventId} - Event-specific leaderboard
- GET /api/leaderboard/snapshot/{snapshotId} - Historical leaderboard snapshot
- POST /api/leaderboard/refresh - Manual trigger ranking recalculation

### Payment APIs
- POST /api/payments/webhook - Stripe/payment provider webhook handler
- GET /api/payments/{paymentId} - Retrieve payment details
- POST /api/payments/verify - Verify payment signature
- POST /api/refunds - Process refund request
- GET /api/payments/history - User payment history

### Authentication APIs
- POST /api/auth/login - User login
- POST /api/auth/signup - User registration
- POST /api/auth/logout - User logout
- POST /api/auth/otp/request - Request OTP code
- POST /api/auth/otp/verify - Verify OTP code
- POST /api/auth/phone/verify - Verify phone number
- POST /api/auth/password/reset - Reset password
- POST /api/auth/refresh - Refresh JWT token

### Fraud Detection APIs
- POST /api/fraud/check - Score incoming vote for fraud risk
- GET /api/fraud/cases - List fraud case queue
- POST /api/fraud/cases/{caseId}/action - Approve/reject flagged vote
- GET /api/fraud/analytics - Fraud metrics and trends
- POST /api/fraud/pattern/detect - Detect suspicious patterns

### Rate Limiting APIs
- GET /api/ratelimit/status - Check rate limit status for user
- POST /api/ratelimit/rules - Create/update rate limit rules (admin)
- GET /api/ratelimit/attempts - View rate limit attempts log

### Subscription APIs
- POST /api/subscriptions - Create subscription
- GET /api/subscriptions/{subscriptionId} - Get subscription details
- POST /api/subscriptions/{subscriptionId}/upgrade - Upgrade plan
- POST /api/subscriptions/{subscriptionId}/cancel - Cancel subscription
- GET /api/subscriptions/{subscriptionId}/usage - Get current quota usage

### Admin & Moderation APIs
- GET /api/admin/dashboard - Admin dashboard metrics
- GET /api/admin/votes - Vote audit log
- POST /api/admin/users/block - Block user
- POST /api/admin/events/status - Update event status
- GET /api/admin/analytics - Platform analytics
- POST /api/admin/fraud/bulk-action - Bulk approve/reject fraud cases

### SaaS Tenant APIs
- POST /api/tenants - Create new tenant
- GET /api/tenants/{tenantId} - Get tenant config
- POST /api/tenants/{tenantId}/config - Update tenant settings
- POST /api/tenants/{tenantId}/branding - Update branding
- GET /api/tenants/{tenantId}/usage - Get tenant usage metrics

## Business Logic & Processing

### Vote Processing Pipeline
- Idempotent vote submission (check idempotency key)
- Atomic vote cap enforcement (lock & increment)
- Vote ledger deduction (subtract from user's remaining votes)
- Vote queue batching (async worker processing)
- Vote validation against event rules
- Concurrent vote collision detection

### Payment Processing
- Webhook signature verification (HMAC-SHA256)
- Idempotent payment record creation
- Payment status state machine (pending → completed/failed)
- Refund processing logic
- Tax calculation (if applicable)
- Currency conversion handling

### Fraud Detection Pipeline
- IP velocity scoring (votes per IP in time window)
- Device fingerprint clustering (unusual device patterns)
- Geo anomaly detection (impossible travel detection)
- Phone reputation scoring
- Vote pattern analysis (rapid successive votes)
- Risk score aggregation (combine multiple signals)
- Fraud decision engine (accept/hold/reject)

### OTP Anti-Spoofing
- OTP code generation (6-digit)
- OTP expiration enforcement (5 minutes default)
- Attempt rate limiting (max 5 attempts per 15 minutes)
- Account lockout after failed attempts (15 min cooldown)
- OTP delivery via SMS/email
- OTP verification logic
- Session creation after successful OTP

### Rate Limiting Engine
- Per-user rate limits (votes per hour/day)
- Per-IP rate limits (requests per minute)
- Edge rate limit coordination with backend
- Rate limit bucket management
- Rate limit reset scheduling
- Sliding window or fixed window algorithm

### Leaderboard & Ranking Engine
- Vote aggregation per contestant
- Score normalization across scoring types
- Weighted aggregation (if judge scoring enabled)
- Rank calculation and sorting
- Rank change detection
- Leaderboard cache invalidation
- Background ranking recalculation job (every N seconds/minutes)
- Rank snapshot freezing at event end

### Scoring Engine (Flexible)
- Raw score collection from judges
- Score normalization (0-100 scale)
- Weighted aggregation (apply weights per score type)
- Multi-phase scoring support
- Manual adjustment capability
- Score locking after submission
- Aggregated final score calculation

### Subscription & Quota Management
- Daily quota reset job (scheduled cron)
- Quota enforcement at vote time
- Quota consumption tracking
- Plan-based quota assignment
- Quota overage handling (allow/deny)
- Recurring billing integration
- Plan upgrade/downgrade quota adjustment

### Queue & Batch Processing
- Vote queue insertion on submission
- Worker polling from queue
- Batch processing (group votes, then insert)
- Dead letter queue for failed votes
- Retry logic with exponential backoff
- Backpressure handling (queue depth monitoring)
- Async job scheduling

### Multi-Region & Replication
- Read replica routing for queries
- Write-master for transactions
- Data replication to regional databases
- Failover strategy implementation
- Region-aware API routing
- Cross-region consistency checks

### Blockchain Anchoring
- Merkle tree construction of all votes
- Content hash generation (SHA-256)
- Blockchain publish job (scheduled)
- Transaction hash storage
- Ballot snapshot encryption
- Vote inclusion proof generation
- Anchor verification logic

## Background Jobs & Scheduled Tasks

- Leaderboard rank recalculation (every 30 seconds)
- Quota reset job (daily at 00:00 UTC per user timezone)
- Fraud pattern detection job (hourly)
- Blockchain anchor publish job (daily or at event end)
- Rate limit window reset job (continuous)
- Expired session cleanup (hourly)
- Expired OTP code cleanup (hourly)
- Payment webhook retry job (every 15 minutes)
- Dead letter queue processing (every 5 minutes)
- Tenant usage aggregation job (daily)
- Audit log archival job (weekly)
- Rank snapshot creation at event milestones

## Monitoring & Observability

### Metrics Collection
- Votes per second (throughput)
- Vote queue depth
- Payment success rate
- Fraud detection rate
- Rate limit trigger frequency
- OTP verification success rate
- API response time percentiles (p50, p95, p99)
- Database query latency
- Job processing time
- Error rate by endpoint
- Subscription quota utilization

### Alerting Rules
- Vote processing latency > 500ms
- Queue depth > threshold
- Fraud score threshold breaches
- Payment failure rate > 5%
- API error rate > 1%
- Rate limit lock engagement > threshold
- Blockchain anchor failures
- Database replica lag > 5 seconds

### Audit Logging
- All vote submissions (user_id, contestant_id, amount, timestamp)
- All payments (user_id, amount, status, timestamp)
- Admin actions (admin_id, action, resource, timestamp)
- Authentication events (user_id, action, ip, timestamp)
- Access logs (user_id, endpoint, method, ip, timestamp)
- Configuration changes (admin_id, setting, old_value, new_value)

### Error Tracking & Logging
- Vote submission errors with context
- Payment processing errors
- OTP generation/verification errors
- Database connection errors
- External service failures (SMS, email, blockchain)
- Worker/job failures
- API validation errors

## Integration Points

- Stripe/payment provider webhook integration
- SMS provider integration (Twilio/AWS SNS)
- Email provider integration (SendGrid/AWS SES)
- Blockchain node integration (if applicable)
- Push notification service integration
- Analytics service integration
- CDN origin server integration
- External fraud scoring service (optional)

## Security & Compliance

- HTTPS/TLS enforcement
- JWT token generation and validation
- Password hashing (bcrypt)
- SQL injection prevention (parameterized queries)
- XSS protection headers
- CSRF token validation
- Rate limit bypass prevention
- Webhook signature verification (HMAC)
- Data encryption at rest (sensitive fields)
- Data encryption in transit
- PII masking in logs
- GDPR compliance (right to be forgotten)
- SOC2 compliance logging
- Payment compliance (PCI DSS)
- Account lockout mechanisms

## Performance Optimization (Backend)

- Database query optimization (indexes on frequently queried columns)
- Connection pooling
- Query result caching (Redis)
- Vote aggregation caching
- Leaderboard caching
- Rate limit cache (Redis)
- Lazy loading of related data
- Batch API responses for list endpoints
- Compressed API responses
- CDN integration for static assets

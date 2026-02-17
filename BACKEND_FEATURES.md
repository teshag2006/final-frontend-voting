# BACKEND FEATURES - Enterprise Voting Platform

## Executive Summary
This document contains **backend-only** infrastructure, services, and systems for a large-scale voting platform. Designed for 5,000+ contestants, 100,000+ concurrent users, 1M+ votes, and high-value payment transactions.

---

## 1. DATABASE ARCHITECTURE

### 1.1 Core Database Schema

#### Events Table
```sql
CREATE TABLE events (
  id BIGINT PRIMARY KEY,
  slug VARCHAR(255) UNIQUE,
  status ENUM('LIVE', 'PAUSED', 'CLOSED', 'ARCHIVED'),
  start_at TIMESTAMP,
  end_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
```

#### Contestants Table
```sql
CREATE TABLE contestants (
  id BIGINT PRIMARY KEY,
  event_id BIGINT NOT NULL,
  category_id INT,
  name VARCHAR(255),
  slug VARCHAR(255),
  thumbnail_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected'),
  created_at TIMESTAMP
);

CREATE INDEX idx_contestants_event ON contestants(event_id);
CREATE INDEX idx_contestants_category ON contestants(event_id, category_id);
CREATE INDEX idx_contestants_name ON contestants(event_id, name);
```

#### Votes Table (Heavy Write Table - 1M+ rows)
```sql
CREATE TABLE votes (
  id BIGINT PRIMARY KEY,
  event_id BIGINT NOT NULL,
  contestant_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  payment_id BIGINT,
  fraud_score SMALLINT,
  status ENUM('confirmed', 'pending', 'rejected'),
  created_at TIMESTAMP
);

-- Partitioning Strategy: Partition by event_id or monthly
PARTITION BY LIST (event_id);
-- Or: PARTITION BY RANGE (created_at) MONTHLY;

CREATE INDEX idx_votes_event ON votes(event_id);
CREATE INDEX idx_votes_contestant ON votes(contestant_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_event_contestant ON votes(event_id, contestant_id);
CREATE INDEX idx_votes_timestamp ON votes(created_at);
```

#### Vote Counters Table (Pre-Aggregated)
```sql
CREATE TABLE vote_counters (
  event_id BIGINT NOT NULL,
  contestant_id BIGINT NOT NULL,
  confirmed_votes BIGINT,
  pending_votes BIGINT,
  rejected_votes BIGINT,
  updated_at TIMESTAMP,
  PRIMARY KEY (event_id, contestant_id)
);

CREATE INDEX idx_vote_counters_event ON vote_counters(event_id);
```

#### Rankings Table (Precomputed)
```sql
CREATE TABLE rankings (
  event_id BIGINT NOT NULL,
  contestant_id BIGINT NOT NULL,
  rank INT,
  vote_count BIGINT,
  computed_at TIMESTAMP,
  PRIMARY KEY (event_id, contestant_id)
);
```

#### Payments Table
```sql
CREATE TABLE payments (
  id BIGINT PRIMARY KEY,
  event_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  gateway_reference VARCHAR(255),
  gateway_name VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_timestamp ON payments(created_at);
```

#### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  status ENUM('active', 'suspended', 'banned', 'pending_verification'),
  fraud_score SMALLINT,
  created_at TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_fraud_score ON users(fraud_score);
```

#### Fraud Log Table
```sql
CREATE TABLE fraud_logs (
  id BIGINT PRIMARY KEY,
  vote_id BIGINT,
  event_id BIGINT,
  user_id BIGINT,
  risk_factors TEXT,
  fraud_score SMALLINT,
  action ENUM('flagged', 'rejected', 'approved', 'manual_review'),
  reviewer_id BIGINT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE INDEX idx_fraud_logs_vote ON fraud_logs(vote_id);
CREATE INDEX idx_fraud_logs_user ON fraud_logs(user_id);
CREATE INDEX idx_fraud_logs_action ON fraud_logs(action);
```

---

## 2. HIGH-SCALE VOTE WRITE ARCHITECTURE

### 2.1 Vote Write Scaling Model

#### Architecture: Decouple Vote Write from Ranking

```
User Request → API Validation → Queue (Redis/Kafka) → Background Worker → DB Update
```

#### Vote Write Flow
1. **API Receives Vote**
   - Validate eligibility
   - Check vote limit
   - Verify payment (if paid)
   - Validate user session

2. **Enqueue Vote**
   - Push to Redis queue or Kafka
   - Include: event_id, contestant_id, user_id, payment_id, fraud_score
   - Respond immediately to user: "Vote recorded"

3. **Background Worker**
   - Batch process votes every 1-5 seconds
   - Batch insert 100-500 votes per transaction
   - Atomic counter increment
   - Update vote_counters table
   - Skip ranking recalculation

4. **Async Ranking Update**
   - Separate worker updates rankings
   - Recalculate every 10-30 seconds
   - Update Redis sorted set
   - Update materialized rankings table

### 2.2 Atomic Counter Strategy

#### Redis INCR (Live Counter)
```
INCR leaderboard:event:123:contestant:456
EXPIRE leaderboard:event:123:contestant:456 300
```

#### Batch Sync to Database
- Every 5 seconds or 1000 votes
- Atomic UPDATE with lock
- Sync Redis counters → vote_counters table
- Ensures no data loss

#### Database Atomic Update (Alternative)
```sql
UPDATE vote_counters 
SET confirmed_votes = confirmed_votes + 1 
WHERE event_id = ? AND contestant_id = ?;
```

### 2.3 Eventual Consistency Model

#### Leaderboard Refresh
- **Delay acceptable**: 5-10 seconds
- **Frontend polling**: 15-30 seconds
- **User expectation**: "~20 seconds old"
- **Benefit**: 90% DB load reduction

#### Vote Counter Sync
- **Frontend**: Shows "approximately" live votes
- **Admin**: Shows exact confirmed votes
- **Leaderboard**: Shows precomputed rankings

---

## 3. HIGH-SCALE CONTESTANT RETRIEVAL

### 3.1 API Design (Never Full Fetch)

#### Paginated Endpoints
```
GET /api/v1/events/:eventId/contestants?page=1&limit=24
GET /api/v1/events/:eventId/contestants?cursor=abc123&limit=24
GET /api/v1/events/:eventId/contestants?search=anna&limit=20
GET /api/v1/events/:eventId/contestants?category=zoneA&page=2
GET /api/v1/events/:eventId/contestants?sort=popular&limit=20
```

#### Response Format
```json
{
  "data": [
    {
      "id": "...",
      "slug": "...",
      "name": "...",
      "thumbnail": "...",
      "voteCount": 1234,
      "rank": 18,
      "category": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 5000,
    "pages": 209
  }
}
```

#### Query Requirements
```sql
WHERE event_id = ?
AND status = 'approved'
LIMIT ? OFFSET ?
```

### 3.2 Server-Side Search

#### Search Implementation
- Database index on `contestants(event_id, name)`
- Use `ILIKE '%search%'` or full-text search
- Minimum 2 characters enforced on API
- Max 50 results per query
- Debounce enforced on client

#### Search Query
```sql
SELECT id, slug, name, thumbnail_url, ... 
FROM contestants
WHERE event_id = ? 
AND name ILIKE ? 
AND status = 'approved'
ORDER BY name ASC
LIMIT 50;
```

### 3.3 Caching Layer

#### Response Caching
- Cache key: `event:123:page:1:category:A`
- TTL: 30-60 seconds (during live event)
- TTL: 5 minutes (after event)
- Invalidate on new vote
- Redis hash storage

#### Leaderboard Cache
- `leaderboard:event:123` (Redis sorted set)
- Updated every vote
- TTL: Never expires (manual clear)

---

## 4. LEADERBOARD CACHING ARCHITECTURE

### 4.1 Precomputed Rankings (Required at 5k+)

#### Option A: Redis Sorted Set (Best for Real-Time)
```
ZADD leaderboard:eventId voteCount contestantId
ZREVRANGE leaderboard:eventId 0 99 WITHSCORES

Example:
ZADD leaderboard:123 1234 456
ZADD leaderboard:123 1500 789
ZREVRANGE leaderboard:123 0 9

Result: [789, 1500, 456, 1234, ...]
```

**Pros**: O(log N), fast updates, real-time
**Cons**: Memory intensive, no persistence by default

#### Option B: Materialized Ranking Table
```sql
CREATE TABLE rankings (
  event_id BIGINT,
  contestant_id BIGINT,
  vote_count BIGINT,
  rank INT,
  computed_at TIMESTAMP,
  PRIMARY KEY (event_id, contestant_id)
);
```

**Pros**: Persistent, queryable, historical
**Cons**: Slightly stale (computed every 10-30s)

### 4.2 Ranking Computation Pipeline

#### Worker Job
```
Every 10 seconds:
1. Aggregate from vote_counters
2. Sort by vote count (DESC)
3. Assign rank (1, 2, 3, ...)
4. Update rankings table
5. Update Redis sorted set
```

#### Pseudo-Code
```python
def recompute_rankings(event_id):
    counters = db.query(
        "SELECT contestant_id, confirmed_votes 
         FROM vote_counters 
         WHERE event_id = ?", event_id)
    
    sorted_counters = sorted(counters, 
                             key=lambda x: x.confirmed_votes, 
                             reverse=True)
    
    for rank, counter in enumerate(sorted_counters, 1):
        db.execute(
            "UPDATE rankings 
             SET rank = ?, vote_count = ? 
             WHERE event_id = ? AND contestant_id = ?",
            rank, counter.confirmed_votes, 
            event_id, counter.contestant_id)
    
    redis.update_sorted_set(
        f"leaderboard:{event_id}", 
        sorted_counters)
```

### 4.3 Cache Layers

#### Level 1: Redis Sorted Set (Live)
- Updated per vote (or batched)
- O(log N) access
- ~100MB for 5k contestants

#### Level 2: Materialized Rankings Table
- Updated every 10 seconds
- Persistent, queryable
- Historical archive

#### Level 3: Static Snapshot (Archived)
- Final rankings frozen
- Read-only cache
- For closed events

### 4.4 Performance Metrics

#### Current Architecture Prevents
- ❌ `SELECT * FROM contestants ORDER BY vote_count DESC` (full scan)
- ❌ Dynamic rank calculation per request
- ❌ Subqueries for ranking position
- ✅ O(1) top 100 retrieval
- ✅ O(log N) rank lookup
- ✅ O(1) vote count increment

---

## 5. VOTE WRITE OPTIMIZATION

### 5.1 Required Indexes (Database)

#### Contestants Indexes
```sql
CREATE INDEX idx_contestants_event ON contestants(event_id);
CREATE INDEX idx_contestants_event_category ON contestants(event_id, category_id);
CREATE INDEX idx_contestants_event_name ON contestants(event_id, name);
CREATE INDEX idx_contestants_event_votes ON contestants(event_id, vote_count DESC);
```

#### Votes Indexes
```sql
CREATE INDEX idx_votes_event ON votes(event_id);
CREATE INDEX idx_votes_contestant ON votes(contestant_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_votes_event_contestant ON votes(event_id, contestant_id);
CREATE INDEX idx_votes_timestamp ON votes(created_at);
CREATE INDEX idx_votes_status ON votes(status);
```

#### Composite Index for Common Query
```sql
-- Query: WHERE event_id = ? AND status = 'confirmed' ORDER BY created_at DESC
CREATE INDEX idx_votes_event_status_time 
ON votes(event_id, status, created_at DESC);
```

#### Payments Indexes
```sql
CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_timestamp ON payments(created_at);
```

### 5.2 Partitioning Strategy

#### Option A: Partition by Event ID
```sql
PARTITION BY LIST (event_id) (
  PARTITION part_event_1 VALUES IN (1),
  PARTITION part_event_2 VALUES IN (2),
  ...
  PARTITION part_other VALUES IN (DEFAULT)
);
```

**Pros**: Isolate each event, easy to archive
**Cons**: Many partitions if many events

#### Option B: Partition by Timestamp (Monthly)
```sql
PARTITION BY RANGE (MONTH(created_at)) (
  PARTITION p_2024_01 VALUES LESS THAN (202402),
  PARTITION p_2024_02 VALUES LESS THAN (202403),
  ...
);
```

**Pros**: Natural archive strategy, manageable partitions
**Cons**: Cross-event queries span partitions

---

## 6. FRAUD DETECTION SCALING

### 6.1 Risk Scoring Model

#### Fraud Score Calculation
```
fraud_score = 0-100

Factors:
- IP velocity (votes per IP per minute): +40 if > 10
- Device fingerprint (votes per device): +30 if > 5
- Geo mismatch (IP country vs user location): +25 if mismatch
- Payment reuse (same card multiple times): +20
- Account age (days since signup): +15 if < 7 days
- Vote frequency (votes per user per minute): +20 if burst
- New email domain: +10 (gmail ok, unknown domain risk)
- Email verification: -10 if verified
- Phone verification: -15 if verified
- User reputation: -5 per 100 successful votes

Scoring:
- < 40: Accept immediately
- 40-70: Flag for manual review
- > 70: Temporarily hold, require verification
```

### 6.2 Real-Time Fraud Pipeline

#### Async Processing
```
Vote Request → Queue → Fraud Worker → Update Status

Do NOT compute fraud synchronously.
```

#### Fraud Worker Job
```python
def process_fraud_check(vote_id):
    vote = db.get_vote(vote_id)
    
    score = 0
    factors = []
    
    # IP Velocity Check
    recent_votes_by_ip = redis.get(f"ip:{vote.ip_address}:votes")
    if recent_votes_by_ip > 10:
        score += 40
        factors.append("high_ip_velocity")
    
    # Device Check
    device_votes = redis.get(f"device:{vote.device_id}:votes")
    if device_votes > 5:
        score += 30
        factors.append("suspicious_device")
    
    # Geo Check
    if vote.ip_country != vote.user_country:
        score += 25
        factors.append("geo_mismatch")
    
    # Account Age Check
    account_age = (now - vote.user_created_at).days
    if account_age < 7:
        score += 15
        factors.append("new_account")
    
    vote.fraud_score = score
    
    if score < 40:
        vote.status = 'confirmed'
    elif score < 70:
        vote.status = 'pending_review'
        notify_fraud_team(vote_id)
    else:
        vote.status = 'rejected'
        require_verification(vote.user_id)
    
    db.save_vote(vote)
    fraud_log = FraudLog(
        vote_id=vote_id,
        fraud_score=score,
        factors=factors,
        action='auto_' + vote.status
    )
    db.save_fraud_log(fraud_log)
```

### 6.3 Scalable Fraud System

#### Vote Statuses
- `confirmed`: Accepted, counted in leaderboard
- `pending_review`: Flagged, waiting admin review
- `rejected`: Rejected, not counted

#### Leaderboard Exclusion
```sql
SELECT * FROM vote_counters
WHERE status IN ('confirmed')
ORDER BY vote_count DESC;
```

Pending/rejected votes excluded from ranking.

### 6.4 Pattern Detection (Background)

#### Batch Fraud Analysis
```python
def detect_fraud_patterns(event_id):
    # Hourly batch job
    
    # 1. Cluster votes by IP
    ip_clusters = cluster_votes_by_ip(event_id)
    for ip_cluster in ip_clusters:
        if len(ip_cluster) > 100 and duration < 5_minutes:
            create_alert(f"IP Spam: {ip_cluster.ip_address}")
    
    # 2. Device fingerprint clustering
    device_clusters = cluster_votes_by_device(event_id)
    for device_cluster in device_clusters:
        if len(device_cluster) > 50:
            create_alert(f"Device Spam: {device_cluster.device_id}")
    
    # 3. Time window analysis
    # Detect burst voting patterns
    for contestant_id in event_contestants:
        votes_per_minute = count_votes_by_minute(
            event_id, 
            contestant_id, 
            last_hour)
        if max(votes_per_minute) > 1000:
            create_alert(f"Vote Burst: {contestant_id}")
```

### 6.5 Manual Fraud Review UI (Backend API)

#### Fraud Queue API
```
GET /api/v1/admin/fraud/pending - Paginated list of flagged votes
POST /api/v1/admin/fraud/:voteId/approve - Confirm vote
POST /api/v1/admin/fraud/:voteId/reject - Reject vote
GET /api/v1/admin/fraud/patterns - Detected patterns
POST /api/v1/admin/fraud/bulk-action - Bulk approve/reject
```

---

## 7. LIVE EVENT TRAFFIC SPIKE ARCHITECTURE

### 7.1 Required Infrastructure Layers

#### Layer 1: CDN
- All static assets cached (images, JS, CSS)
- Origin shield
- Compression (gzip, brotli)
- Global edge caching

#### Layer 2: API Rate Limiting
```
Per IP: 100 requests/minute
Per User: 50 requests/minute
Per Device: 200 requests/minute
Per Contestant: 10,000 votes/minute (system-wide limit)
```

#### Layer 3: Horizontal Scaling
- Backend: 10-20 stateless instances
- Auto-scale on CPU > 70%
- Load balancer (sticky sessions via Redis)
- No in-memory session state

#### Layer 4: Write Queue
- Redis queue or Kafka
- 50,000 votes/min = ~830 votes/sec
- Queue absorbs spikes
- Workers process 100-500 at a time

#### Layer 5: Read Caching
- Leaderboard: Redis (30s TTL)
- Contestant lists: 5 min TTL
- Payment status: 2 min TTL

#### Layer 6: Circuit Breakers
```
If:
- DB response time > 2 seconds: Degrade to cached data
- Payment gateway unavailable: Queue payments, show "delayed"
- Fraud engine slow: Default to low risk
```

### 7.2 Scaling Assumptions (Peak Event)

#### Traffic Model
- **200,000 concurrent users**
- **50,000 voting in 5 minutes** = ~830 votes/sec
- **100 leaderboard refreshes/sec**
- **1,000 page views/sec**

#### Database Load
- **Vote writes**: 830/sec (queued, batched to 100/sec)
- **Leaderboard reads**: 100 queries/sec
- **Contestant reads**: 500 queries/sec
- **Total DB QPS**: ~1000 read, 100 write

#### Cache Load
- **Redis**: 5,000 GET ops/sec
- **Memory**: ~500MB for full leaderboard + hot data

---

## 8. PAYMENT PROCESSING INTEGRATION

### 8.1 Payment Gateway Integration

#### Supported Gateways
- Stripe
- PayPal
- Square
- Flutterwave (Africa-specific)
- Local gateways per region

#### Payment Flow
```
1. User selects votes quantity
2. System calculates total amount
3. Redirect to payment gateway
4. Gateway processes payment
5. Webhook callback to backend
6. Verify payment signature
7. Create vote transaction
8. Enqueue votes
9. Redirect to success page
```

#### Webhook Handler
```python
def process_payment_webhook(gateway_name, payload):
    # Verify signature
    is_valid = verify_gateway_signature(gateway_name, payload)
    if not is_valid:
        return 401, "Invalid signature"
    
    payment_ref = payload['reference']
    payment = db.get_payment_by_reference(payment_ref)
    
    if payload['status'] == 'success':
        payment.status = 'completed'
        
        # Enqueue votes
        for i in range(payment.vote_quantity):
            enqueue_vote(
                event_id=payment.event_id,
                user_id=payment.user_id,
                payment_id=payment.id,
                contestant_id=payment.contestant_id
            )
    else:
        payment.status = 'failed'
    
    db.save_payment(payment)
    return 200, "OK"
```

### 8.2 Payment Storage

#### Payment Records
```sql
CREATE TABLE payments (
  id BIGINT PRIMARY KEY,
  event_id BIGINT,
  user_id BIGINT,
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  vote_quantity INT,
  contestant_id BIGINT,
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  gateway_name VARCHAR(50),
  gateway_reference VARCHAR(255) UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 8.3 Refund Processing

#### Refund Flow
```python
def process_refund(payment_id, reason):
    payment = db.get_payment(payment_id)
    
    # Call gateway API
    refund_result = gateway.refund(
        payment.gateway_reference,
        payment.amount
    )
    
    if refund_result['success']:
        payment.status = 'refunded'
        
        # Dequeue votes (mark as 'refunded')
        votes = db.get_votes_by_payment(payment_id)
        for vote in votes:
            vote.status = 'refunded'
            db.save_vote(vote)
        
        # Update vote counters
        recalculate_counters(payment.event_id)
    
    db.save_payment(payment)
```

---

## 9. AUTHENTICATION & SESSION MANAGEMENT

### 9.1 User Authentication

#### Password Hashing
- Algorithm: Argon2 (bcrypt as backup)
- Cost factor: 2^14
- Never store plaintext passwords

#### Session Management
- HTTP-only cookies (not localStorage)
- SameSite=Strict
- Secure flag (HTTPS only)
- Session timeout: 24 hours
- Redis session store (not database)

#### Token Strategy
- **Access token**: Short-lived (15 mins), JWT
- **Refresh token**: Long-lived (7 days), stored in HTTP-only cookie

#### Password Reset Flow
```python
def request_password_reset(email):
    user = db.get_user_by_email(email)
    reset_token = generate_secure_token()
    redis.setex(
        f"reset:{reset_token}",
        3600,  # 1 hour
        user.id
    )
    send_email(email, reset_link=reset_token)

def reset_password(token, new_password):
    user_id = redis.get(f"reset:{token}")
    if not user_id:
        raise ValueError("Token expired")
    
    user = db.get_user(user_id)
    user.password_hash = hash_password(new_password)
    db.save_user(user)
    redis.delete(f"reset:{token}")
```

### 9.2 Two-Factor Authentication (Optional)

#### TOTP (Time-based OTP)
- Google Authenticator
- Backup codes
- Optional enforcement for admins

### 9.3 Phone Verification

#### OTP via SMS
```python
def request_phone_verification(phone):
    otp = generate_otp()  # 6-digit
    redis.setex(
        f"otp:{phone}",
        600,  # 10 minutes
        otp
    )
    send_sms(phone, f"Your OTP: {otp}")

def verify_phone_otp(phone, otp):
    stored_otp = redis.get(f"otp:{phone}")
    if stored_otp == otp:
        user.phone_verified = True
        db.save_user(user)
        return True
    return False
```

---

## 10. MULTI-TENANT ARCHITECTURE (SaaS)

### 10.1 Tenant Isolation

#### Tenant-Aware Queries
```sql
-- All queries must include tenant_id
WHERE organization_id = ? AND ...

-- Never allow cross-tenant queries
```

#### Data Isolation
- Separate schema per tenant (optional)
- Row-level isolation (recommended)
- Encryption per tenant

### 10.2 Tenant Routing

#### Tenant Detection
```python
def get_tenant_from_request(request):
    # Via subdomain
    if request.host.startswith("acme."):
        return Tenant.get_by_subdomain("acme")
    
    # Via API key
    if request.headers.get("X-API-Key"):
        return Tenant.get_by_api_key(
            request.headers["X-API-Key"])
    
    # Via user session
    user = get_current_user(request)
    return user.tenant
```

### 10.3 Tenant Database

#### Multi-Tenant Schema
```sql
CREATE TABLE organizations (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  branding_color VARCHAR(7),
  logo_url VARCHAR(500),
  domain VARCHAR(255),
  status ENUM('active', 'suspended'),
  created_at TIMESTAMP
);

CREATE TABLE organization_users (
  id BIGINT PRIMARY KEY,
  organization_id BIGINT,
  user_id BIGINT,
  role ENUM('admin', 'moderator', 'viewer'),
  created_at TIMESTAMP
);

-- All other tables include organization_id
CREATE TABLE organization_events (
  id BIGINT PRIMARY KEY,
  organization_id BIGINT NOT NULL,
  ...
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

### 10.4 White-Label Configuration

#### Branding Per Tenant
```python
def get_tenant_branding(organization_id):
    org = db.get_organization(organization_id)
    return {
        "primary_color": org.branding_color,
        "logo_url": org.logo_url,
        "company_name": org.name,
        "domain": org.domain,
        "custom_css": org.custom_css
    }
```

---

## 11. SUBSCRIPTION & BILLING

### 11.1 Subscription Models

#### Pay-Per-Vote
- Cost per vote: Configurable per tenant
- No subscription
- Microcharge model

#### Subscription (Vote Credits)
- Monthly plans: 100, 500, 1000 votes
- Rollover policy (yes/no)
- Auto-renewal
- Cancel anytime

#### Tiered Voting
- Free: 1 vote/day
- Premium: Unlimited

### 11.2 Subscription Database

#### Subscription Schema
```sql
CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY,
  organization_id BIGINT,
  user_id BIGINT,
  plan_id INT,
  status ENUM('active', 'past_due', 'canceled', 'expired'),
  vote_credits INT,
  renewal_date DATE,
  payment_method_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE subscription_plans (
  id INT PRIMARY KEY,
  organization_id BIGINT,
  name VARCHAR(255),
  vote_credits INT,
  monthly_price DECIMAL(10, 2),
  created_at TIMESTAMP
);
```

### 11.3 Credit Management

#### Vote Credit Logic
```python
def deduct_vote_credit(user_id, event_id, quantity):
    subscription = db.get_active_subscription(user_id)
    if not subscription:
        raise ValueError("No active subscription")
    
    if subscription.vote_credits < quantity:
        raise ValueError("Insufficient credits")
    
    subscription.vote_credits -= quantity
    db.save_subscription(subscription)
    
    # Log for analytics
    log_credit_usage(user_id, event_id, quantity)
```

---

## 12. MULTI-REGION DEPLOYMENT

### 12.1 Architecture

#### Primary Region
- Handles all writes
- Payment webhooks
- Fraud engine
- Vote processing

#### Read Replicas (Per Region)
```
Primary DB → Replication → Read Replica (Region A)
                        → Read Replica (Region B)
```

#### Read-Only Edge Regions
- Serve contestant browsing
- Cache leaderboard reads
- Participant lookup

### 12.2 Failover Strategy

#### Database Replication
```sql
-- Primary (master)
Postgres primary with streaming replication

-- Replica setup
STANDBY_MODE = 'on'
primary_conninfo = 'host=primary.db.example.com'
```

#### Failover Detection
```python
def check_primary_health():
    try:
        db.primary.execute("SELECT 1")
        return True
    except Exception:
        # Promote replica
        promote_read_replica()
        return False
```

#### RTO/RPO
- **RTO** (Recovery Time Objective): 5 minutes
- **RPO** (Recovery Point Objective): 1 minute
- Daily backups to S3
- Point-in-time recovery

---

## 13. MONITORING & OBSERVABILITY

### 13.1 Metrics Collection

#### Key Metrics
- **Vote throughput**: Votes per second
- **API latency**: p50, p95, p99
- **DB query time**: Slow query log
- **Cache hit rate**: Redis hit/miss %
- **Queue depth**: Pending votes in queue
- **Fraud score distribution**: % above threshold
- **Payment success rate**: Completed / attempted
- **User login rate**: Successful / failed

#### Metrics Stack
- Prometheus (metrics collection)
- Grafana (visualization)
- CloudWatch (AWS logs)
- DataDog or New Relic (APM)

### 13.2 Logging

#### Structured Logging
```json
{
  "timestamp": "2024-01-15T14:30:00Z",
  "level": "INFO",
  "service": "vote-worker",
  "event_id": "123",
  "votes_processed": 500,
  "duration_ms": 1200,
  "trace_id": "abc123"
}
```

#### Log Aggregation
- ELK Stack (Elasticsearch, Logstash, Kibana)
- CloudWatch Logs
- Datadog Logs
- Retention: 30 days for debug, 1 year for audit

### 13.3 Alerting

#### Alert Rules
- **High CPU**: > 80% for 5 minutes
- **High memory**: > 90%
- **Vote queue depth**: > 10,000
- **API latency p95**: > 2 seconds
- **Payment failure rate**: > 5%
- **Fraud score spike**: > 50% flagged
- **DB replication lag**: > 5 seconds

### 13.4 Distributed Tracing

#### Tracing Setup
```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("process_vote") as span:
    span.set_attribute("event_id", event_id)
    span.set_attribute("user_id", user_id)
    # ... processing
```

---

## 14. SECURITY ARCHITECTURE

### 14.1 DDoS Protection

#### Rate Limiting
- Per-IP rate limit: 100 requests/min
- Per-user rate limit: 50 requests/min
- Burst capacity: 200 requests/10 sec
- CloudFlare or AWS Shield for L3/L4

#### WAF Rules
```
- Block suspicious user agents
- Block SQL injection patterns
- Block XSS patterns
- Require valid headers
- Geographic blocking (optional)
```

### 14.2 API Security

#### Authentication
- JWT tokens (RS256 signature)
- Token expiry: 15 minutes
- Refresh tokens: 7 days
- Token rotation on refresh

#### Authorization
- Role-based access control (RBAC)
- Roles: admin, moderator, viewer, user
- Permission matrix
- Endpoint-level checks

#### CORS
```python
ALLOWED_ORIGINS = [
    "https://example.com",
    "https://*.example.com"
]

@app.middleware("cors")
def add_cors(request):
    if request.origin in ALLOWED_ORIGINS:
        return cors_headers
```

### 14.3 Data Encryption

#### In Transit
- TLS 1.3
- Strong cipher suites
- Certificate pinning (optional)

#### At Rest
- Database encryption (AWS RDS encryption)
- S3 encryption (AES-256)
- PII encryption (separate keys per tenant)

### 14.4 Secrets Management

#### Secrets Storage
- AWS Secrets Manager
- HashiCorp Vault
- Environment variables (NO secrets in code)
- Rotation: API keys every 90 days

---

## 15. BLOCKCHAIN INTEGRATION (Optional)

### 15.1 Vote Anchoring

#### Blockchain Strategy
- Record vote hash every 1000 votes
- Merkle tree root on blockchain
- Immutable audit trail
- Post-event verification

#### Implementation
```python
def anchor_votes_to_blockchain(event_id):
    votes = get_votes_batch(event_id, last_1000)
    vote_hashes = [hash_vote(v) for v in votes]
    merkle_root = compute_merkle_root(vote_hashes)
    
    tx = blockchain.submit_transaction(
        contract="VoteAnchor",
        method="recordRoot",
        params=[event_id, merkle_root, timestamp]
    )
    
    store_transaction_id(tx.hash, event_id)
```

### 15.2 Verification

#### Voter Verification
```python
def verify_vote_on_blockchain(vote_id):
    vote = db.get_vote(vote_id)
    merkle_proof = compute_proof(vote_id)
    
    is_valid = blockchain.verify(
        vote_hash=hash_vote(vote),
        merkle_root=get_anchored_root(vote.event_id),
        proof=merkle_proof
    )
    return is_valid
```

---

## 16. ANALYTICS & REPORTING

### 16.1 Analytics Engine

#### Event Analytics
- Total votes
- Unique voters
- Vote distribution by contestant
- Vote distribution by time
- Conversion rate (viewers → voters)
- Revenue per event

#### User Analytics
- Active users (DAU, MAU)
- User retention
- Average votes per user
- Payment LTV
- Churn rate

### 16.2 Analytics Pipeline

```
API Events → Kafka → Data Warehouse (BigQuery/Snowflake) → BI Tool
```

#### Event Tracking
```python
def log_analytics_event(event_type, properties):
    event = {
        "event_type": event_type,
        "timestamp": now(),
        "user_id": get_user_id(),
        "properties": properties
    }
    kafka_producer.send("analytics_events", event)
```

### 16.3 Report Generation

#### Automated Reports
- Daily event summary
- Weekly admin dashboard
- Monthly revenue report
- Fraud alerts summary

#### Export Formats
- CSV
- PDF
- Excel
- JSON API

---

## 17. INFRASTRUCTURE AS CODE

### 17.1 Deployment

#### IaC Tools
- Terraform
- Docker Compose / Kubernetes
- GitHub Actions CI/CD

#### Environment Configuration
```hcl
# terraform/variables.tf
variable "event_name" {}
variable "max_concurrent_users" { default = 100000 }
variable "database_instance_type" { default = "db.r6i.4xlarge" }
variable "cache_node_type" { default = "cache.r6g.xlarge" }
```

### 17.2 Scaling Groups

#### Auto-Scaling Policy
```
Target: 70% CPU utilization
Min instances: 3
Max instances: 20
Scale up: 2 instances per 30 seconds
Scale down: 1 instance per 5 minutes
```

---

## 18. PERFORMANCE BENCHMARKS

### 18.1 Database Performance Targets

#### Query Latencies (p95)
- Page load (20 contestants): < 200ms
- Search query: < 150ms
- Leaderboard top 100: < 50ms
- Single vote insert (batched): < 10ms

#### Throughput
- Vote processing: 1000 votes/sec
- Reads: 10,000 requests/sec
- Writes: 1000 writes/sec

### 18.2 Cache Performance

#### Hit Rates Target
- Leaderboard cache: 95%+
- Contestant data cache: 90%+
- API response cache: 85%+

### 18.3 API Response Times

#### Target Latencies (p95)
- List contestants: < 500ms
- Get single contestant: < 200ms
- Submit vote: < 1000ms (including payment)
- Leaderboard: < 300ms

---

## 19. COST OPTIMIZATION

### 19.1 Database Cost

#### Estimation (AWS RDS)
- db.r6i.4xlarge: ~$2.5/hour
- 1M votes/month storage: ~$10
- Backup storage (30 days): ~$20

#### Cost Control
- Reserved instances: 30% discount
- Read replicas: On-demand only
- Archive old data: S3 Glacier

### 19.2 Caching Cost

#### Redis (AWS ElastiCache)
- cache.r6g.xlarge: ~$0.8/hour
- 1M requests/month: Negligible

### 19.3 Data Transfer Cost

#### Bandwidth
- CDN: $0.085/GB
- Cross-region: $0.02/GB
- S3 transfer out: $0.09/GB

#### Optimization
- CloudFront for CDN
- Regional caching
- Compression

---

## 20. SYSTEM EVOLUTION STAGES

### Stage 1: Direct DB Writes (Small Scale)
- Single database server
- Direct INSERT into votes table
- ~1000 concurrent users
- ~100 votes/sec peak

### Stage 2: Add Caching Layer
- Redis for leaderboard
- Cache contestant lists
- ~10,000 concurrent users
- ~500 votes/sec peak

### Stage 3: Add Queue Architecture
- Redis/Kafka for vote queue
- Background workers
- ~50,000 concurrent users
- ~5,000 votes/sec peak

### Stage 4: Add Fraud Scoring
- Async fraud computation
- Pattern detection
- Manual review queue
- Maintains 5,000 votes/sec

### Stage 5: Add Read Replicas
- Multi-region read replicas
- Edge caching
- ~100,000 concurrent users
- ~10,000 votes/sec peak

### Stage 6: Event-Night Hardened
- Full event night preparation
- Circuit breakers
- CDN optimization
- All layers at capacity
- ~200,000 concurrent users
- ~50,000 votes in 5 minutes

---

## TECHNICAL STACK RECOMMENDATIONS

- **Language**: Python 3.11+ or Node.js
- **Framework**: FastAPI (Python) or Express (Node.js)
- **Database**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Queue**: RabbitMQ or Kafka
- **Search**: Elasticsearch (if needed)
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Deployment**: Kubernetes or Docker Compose
- **IaC**: Terraform
- **CI/CD**: GitHub Actions or GitLab CI

---

## DEPLOYMENT CHECKLIST

- [ ] Database migrations tested
- [ ] Indexes created and tested
- [ ] Queue system operational
- [ ] Redis caching configured
- [ ] Payment gateway webhooks verified
- [ ] Fraud detection system active
- [ ] Monitoring alerts configured
- [ ] Backup strategy tested
- [ ] DDoS protection enabled
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation complete

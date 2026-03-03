-- =====================================================
-- PostgreSQL Schema for VoteChain Voting System
-- Converted from MySQL/MariaDB 10.4
-- Generated: 2026-02-13
-- FULLY CORRECTED VERSION WITH:
-- ✓ Foreign Key Constraints
-- ✓ Indexes (Performance & Uniqueness)
-- ✓ Fixed camelCase columns to snake_case
-- ✓ Triggers migrated
-- ✓ Seed data included
-- =====================================================

BEGIN;

-- =====================================================
-- DROP EXISTING TABLES (for safe re-runs)
-- =====================================================

DROP TABLE IF EXISTS webhook_signature_logs CASCADE;
DROP TABLE IF EXISTS webhook_failures CASCADE;
DROP TABLE IF EXISTS webhook_attempts CASCADE;
DROP TABLE IF EXISTS webhook_audit CASCADE;
DROP TABLE IF EXISTS webhook_rate_limit CASCADE;
DROP TABLE IF EXISTS webhook_secrets CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS vpn_detections CASCADE;
DROP TABLE IF EXISTS timezone_anomalies CASCADE;
DROP TABLE IF EXISTS geographic_velocity_logs CASCADE;
DROP TABLE IF EXISTS payment_vote_mismatches CASCADE;
DROP TABLE IF EXISTS payment_vote_reconciliation CASCADE;
DROP TABLE IF EXISTS merkle_proof_verifications CASCADE;
DROP TABLE IF EXISTS merkle_proofs CASCADE;
DROP TABLE IF EXISTS blockchain_job_queue CASCADE;
DROP TABLE IF EXISTS blockchain_audit_log CASCADE;
DROP TABLE IF EXISTS blockchain_anchors CASCADE;
DROP TABLE IF EXISTS fraud_alerts CASCADE;
DROP TABLE IF EXISTS alerts_triggered CASCADE;
DROP TABLE IF EXISTS anomaly_detection_history CASCADE;
DROP TABLE IF EXISTS fraud_logs CASCADE;
DROP TABLE IF EXISTS vote_behavior_profiles CASCADE;
DROP TABLE IF EXISTS vote_merkle_hashes CASCADE;
DROP TABLE IF EXISTS vote_locations CASCADE;
DROP TABLE IF EXISTS vote_receipts CASCADE;
DROP TABLE IF EXISTS vote_batches CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS bot_pattern_detections CASCADE;
DROP TABLE IF EXISTS device_reputation CASCADE;
DROP TABLE IF EXISTS trust_score_history CASCADE;
DROP TABLE IF EXISTS device_fingerprints CASCADE;
DROP TABLE IF EXISTS device_anomalies CASCADE;
DROP TABLE IF EXISTS stripe_webhooks CASCADE;
DROP TABLE IF EXISTS refund_requests CASCADE;
DROP TABLE IF EXISTS crypto_payments CASCADE;
DROP TABLE IF EXISTS vote_snapshots CASCADE;
DROP TABLE IF EXISTS verified_votes_cache CASCADE;
DROP TABLE IF EXISTS contestant_media_gallery CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS final_results_certificates CASCADE;
DROP TABLE IF EXISTS payment_limits CASCADE;
DROP TABLE IF EXISTS contestant_applications CASCADE;
DROP TABLE IF EXISTS contestants CASCADE;
DROP TABLE IF EXISTS incident_reports CASCADE;
DROP TABLE IF EXISTS leaderboard_cache_control CASCADE;
DROP TABLE IF EXISTS ip_velocity_tracking CASCADE;
DROP TABLE IF EXISTS crypto_wallets CASCADE;
DROP TABLE IF EXISTS geo_analysis_cache CASCADE;
DROP TABLE IF EXISTS blockchain_stats CASCADE;
DROP TABLE IF EXISTS fraud_detection_cycles CASCADE;
DROP TABLE IF EXISTS exports CASCADE;
DROP TABLE IF EXISTS event_sponsors CASCADE;
DROP TABLE IF EXISTS event_locks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS user_roles_permissions CASCADE;
DROP TABLE IF EXISTS user_geo_preferences CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS sponsor_partners CASCADE;
DROP TABLE IF EXISTS payment_providers CASCADE;
DROP TABLE IF EXISTS rsa_key_versions CASCADE;
DROP TABLE IF EXISTS geo_risk_profiles CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS rate_limit_logs CASCADE;
DROP TABLE IF EXISTS shard_registry CASCADE;
DROP TABLE IF EXISTS feature_flags CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS db_health_checks CASCADE;
DROP TABLE IF EXISTS system_events CASCADE;
DROP TABLE IF EXISTS monitoring_metrics CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;
DROP TABLE IF EXISTS vpn_ip_database CASCADE;
DROP TABLE IF EXISTS suspicious_ip_reputation CASCADE;
DROP TABLE IF EXISTS security_tokens CASCADE;
DROP TABLE IF EXISTS crypto_audit_log CASCADE;
DROP TABLE IF EXISTS certificate_revocations CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS alert_rules CASCADE;
DROP TABLE IF EXISTS admin_audit_log CASCADE;
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS account_audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sponsors CASCADE;

-- Drop ENUM types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS contestant_status CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS vote_type CASCADE;
DROP TYPE IF EXISTS vote_status CASCADE;
DROP TYPE IF EXISTS fraud_risk_level CASCADE;
DROP TYPE IF EXISTS batch_status CASCADE;
DROP TYPE IF EXISTS fraud_severity CASCADE;
DROP TYPE IF EXISTS fraud_cycle_status CASCADE;
DROP TYPE IF EXISTS fraud_alert_level CASCADE;
DROP TYPE IF EXISTS payment_provider CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_verification_status CASCADE;
DROP TYPE IF EXISTS payment_provider_env CASCADE;
DROP TYPE IF EXISTS payment_provider_status CASCADE;
DROP TYPE IF EXISTS refund_status CASCADE;
DROP TYPE IF EXISTS webhook_status CASCADE;
DROP TYPE IF EXISTS webhook_provider CASCADE;
DROP TYPE IF EXISTS webhook_event_status CASCADE;
DROP TYPE IF EXISTS webhook_audit_type CASCADE;
DROP TYPE IF EXISTS blockchain_status_enum CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS db_health_status CASCADE;
DROP TYPE IF EXISTS system_event_severity CASCADE;
DROP TYPE IF EXISTS log_type CASCADE;
DROP TYPE IF EXISTS incident_severity CASCADE;
DROP TYPE IF EXISTS incident_status CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS velocity_severity CASCADE;
DROP TYPE IF EXISTS ip_threat_level CASCADE;
DROP TYPE IF EXISTS otp_type CASCADE;
DROP TYPE IF EXISTS theme_preference CASCADE;
DROP TYPE IF EXISTS privacy_level CASCADE;
DROP TYPE IF EXISTS two_factor_method CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS security_token_type CASCADE;
DROP TYPE IF EXISTS sponsor_tier CASCADE;
DROP TYPE IF EXISTS export_status CASCADE;
DROP TYPE IF EXISTS sync_status CASCADE;
DROP TYPE IF EXISTS feature_environment CASCADE;
DROP TYPE IF EXISTS app_settings_category CASCADE;

-- =====================================================
-- SECTION 1: ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('admin', 'contestant', 'voter', 'transparency', 'media', 'observer');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE event_status AS ENUM ('draft', 'scheduled', 'active', 'completed', 'cancelled');
CREATE TYPE contestant_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'disqualified');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE media_type AS ENUM ('photo', 'video');
CREATE TYPE vote_type AS ENUM ('free', 'paid');
CREATE TYPE vote_status AS ENUM ('pending', 'valid', 'invalid', 'fraud_suspected', 'cancelled');
CREATE TYPE fraud_risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE batch_status AS ENUM ('open', 'closed', 'verified', 'archived');
CREATE TYPE fraud_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE fraud_cycle_status AS ENUM ('running', 'completed', 'cancelled');
CREATE TYPE fraud_alert_level AS ENUM ('info', 'warning', 'critical');
CREATE TYPE payment_provider AS ENUM ('telebirr', 'santimpay', 'paypal', 'chapa', 'stripe', 'crypto', 'manual');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE payment_verification_status AS ENUM ('pending', 'verified', 'failed');
CREATE TYPE payment_provider_env AS ENUM ('test', 'live');
CREATE TYPE payment_provider_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'processed');
CREATE TYPE webhook_status AS ENUM ('received', 'processing', 'processed', 'failed', 'retrying');
CREATE TYPE webhook_provider AS ENUM ('chapa', 'paypal', 'telebirr', 'santimpay');
CREATE TYPE webhook_event_status AS ENUM ('success', 'failure', 'skipped');
CREATE TYPE webhook_audit_type AS ENUM ('signature_validation', 'idempotency_check', 'payment_creation', 'vote_creation', 'error');
CREATE TYPE blockchain_status_enum AS ENUM ('success', 'failed', 'pending');
CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE db_health_status AS ENUM ('healthy', 'warning', 'critical');
CREATE TYPE system_event_severity AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE log_type AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE incident_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE incident_status AS ENUM ('open', 'investigating', 'resolved', 'closed');
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE velocity_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ip_threat_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE otp_type AS ENUM ('email', 'phone', '2fa');
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');
CREATE TYPE privacy_level AS ENUM ('public', 'private', 'friends');
CREATE TYPE two_factor_method AS ENUM ('sms', 'email', 'authenticator');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE security_token_type AS ENUM ('jwt', 'refresh', 'verification', 'password_reset');
CREATE TYPE sponsor_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE export_status AS ENUM ('generating', 'ready', 'expired', 'failed');
CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'completed', 'failed');
CREATE TYPE feature_environment AS ENUM ('development', 'staging', 'production');
CREATE TYPE app_settings_category AS ENUM ('voting', 'payment', 'general', 'rate_limit', 'feature');

-- =====================================================
-- SECTION 2: TABLE DEFINITIONS (dependency order)
-- =====================================================

-- -----------------------------------------------
-- Group 1: No dependencies
-- -----------------------------------------------

CREATE TABLE users (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) DEFAULT NULL,
  last_name VARCHAR(100) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  role user_role DEFAULT 'voter',
  status user_status DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP DEFAULT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  daily_vote_limit INTEGER DEFAULT NULL,
  daily_spending_limit NUMERIC(10,2) DEFAULT NULL,
  phone_verified_at TIMESTAMP DEFAULT NULL,
  last_login TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE sponsors (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(512) DEFAULT NULL,
  website_url VARCHAR(512) DEFAULT NULL,
  tier sponsor_tier DEFAULT 'bronze',
  contact_email VARCHAR(255) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  scheduled_date TIMESTAMP DEFAULT NULL,
  started_date TIMESTAMP DEFAULT NULL,
  terminated_date TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Group 2: Depends on users
-- -----------------------------------------------

CREATE TABLE events (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  status event_status DEFAULT 'draft',
  season INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  voting_start TIMESTAMP NOT NULL,
  voting_end TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  country VARCHAR(100) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  creator_id INTEGER NOT NULL REFERENCES users(id),
  featured_image_url VARCHAR(512) DEFAULT NULL,
  banner_image_url VARCHAR(512) DEFAULT NULL,
  rules TEXT DEFAULT NULL,
  terms_conditions TEXT DEFAULT NULL,
  max_contestants INTEGER DEFAULT 100,
  min_age INTEGER DEFAULT 18,
  max_votes_per_user INTEGER DEFAULT NULL,
  max_daily_votes_per_user INTEGER DEFAULT NULL,
  daily_spending_cap NUMERIC(10,2) DEFAULT NULL,
  allow_international BOOLEAN DEFAULT FALSE,
  verification_required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  device_fingerprint VARCHAR(255) NOT NULL,
  device_name VARCHAR(255) DEFAULT NULL,
  device_model VARCHAR(100) DEFAULT NULL,
  device_type VARCHAR(50) DEFAULT NULL,
  os_name VARCHAR(50) DEFAULT NULL,
  os_version VARCHAR(50) DEFAULT NULL,
  browser_name VARCHAR(50) DEFAULT NULL,
  browser_version VARCHAR(50) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  latitude NUMERIC(10,8) DEFAULT NULL,
  longitude NUMERIC(11,8) DEFAULT NULL,
  last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reputation_score NUMERIC(3,2) DEFAULT 0.50,
  last_fraud_check TIMESTAMP DEFAULT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason VARCHAR(255) DEFAULT NULL,
  -- Fraud detection fields
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP DEFAULT NULL,
  first_seen TIMESTAMP DEFAULT NULL,
  last_active TIMESTAMP DEFAULT NULL,
  is_mobile BOOLEAN DEFAULT FALSE,
  timezone VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  theme theme_preference DEFAULT 'system',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  privacy_level privacy_level DEFAULT 'private',
  show_vote_history BOOLEAN DEFAULT FALSE,
  show_payment_history BOOLEAN DEFAULT FALSE,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method two_factor_method DEFAULT NULL,
  receive_updates BOOLEAN DEFAULT TRUE,
  receive_promotions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles_permissions (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  permission VARCHAR(100) NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by INTEGER DEFAULT NULL,
  revoked_at TIMESTAMP DEFAULT NULL,
  revoked_by INTEGER DEFAULT NULL
);

CREATE TABLE user_geo_preferences (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  allowed_countries JSONB DEFAULT NULL,
  allowed_timezones JSONB DEFAULT NULL,
  block_vpn BOOLEAN DEFAULT TRUE,
  block_proxy BOOLEAN DEFAULT TRUE,
  block_tor BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_verifications (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  type otp_type DEFAULT 'email',
  is_used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  notification_type VARCHAR(100) DEFAULT NULL,
  title VARCHAR(255) DEFAULT NULL,
  message TEXT DEFAULT NULL,
  related_entity_type VARCHAR(100) DEFAULT NULL,
  related_entity_id INTEGER DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP DEFAULT NULL,
  action_url VARCHAR(512) DEFAULT NULL,
  priority notification_priority DEFAULT 'normal',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE account_audit_logs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_actions (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INTEGER NOT NULL,
  details JSONB DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_audit_log (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  admin_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) DEFAULT NULL,
  entity_id INTEGER DEFAULT NULL,
  changes JSONB DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  admin_id INTEGER DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) DEFAULT NULL,
  entity_id INTEGER DEFAULT NULL,
  changes JSONB DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alert_rules (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  rule_name VARCHAR(255) DEFAULT NULL,
  condition TEXT DEFAULT NULL,
  threshold NUMERIC(10,2) DEFAULT NULL,
  severity alert_severity DEFAULT 'medium',
  enabled BOOLEAN DEFAULT TRUE,
  created_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE security_tokens (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type security_token_type DEFAULT 'jwt',
  token VARCHAR(512) NOT NULL,
  expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP DEFAULT NULL,
  revoked_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  type log_type DEFAULT 'info',
  message TEXT NOT NULL,
  details JSONB DEFAULT NULL,
  user_id INTEGER DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crypto_audit_log (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  action VARCHAR(100) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  performed_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificate_revocations (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  certificate_id VARCHAR(255) DEFAULT NULL,
  revocation_reason VARCHAR(255) DEFAULT NULL,
  revoked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Group 3: Depends on events
-- -----------------------------------------------

CREATE TABLE categories (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  category_order INTEGER DEFAULT 0,
  voting_enabled BOOLEAN DEFAULT TRUE,
  public_voting BOOLEAN DEFAULT TRUE,
  paid_voting BOOLEAN DEFAULT FALSE,
  minimum_vote_amount NUMERIC(10,2) DEFAULT 0.00,
  accept_write_ins BOOLEAN DEFAULT FALSE,
  daily_vote_limit INTEGER DEFAULT NULL,
  max_votes_per_user INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_locks (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER DEFAULT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  lock_reason VARCHAR(255) DEFAULT NULL,
  locked_by INTEGER DEFAULT NULL,
  locked_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_sponsors (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  sponsor_id INTEGER NOT NULL,
  placement VARCHAR(100) DEFAULT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exports (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  created_by INTEGER DEFAULT NULL,
  export_type VARCHAR(50) DEFAULT NULL,
  file_format VARCHAR(10) DEFAULT NULL,
  file_url VARCHAR(512) DEFAULT NULL,
  file_size INTEGER DEFAULT NULL,
  export_status export_status DEFAULT 'generating',
  rows_exported INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NULL,
  downloaded_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE fraud_detection_cycles (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  cycle_number INTEGER DEFAULT NULL,
  start_time TIMESTAMP DEFAULT NULL,
  end_time TIMESTAMP DEFAULT NULL,
  total_votes_checked INTEGER DEFAULT 0,
  fraudulent_votes_found INTEGER DEFAULT 0,
  fraud_percentage NUMERIC(5,2) DEFAULT NULL,
  cycle_status fraud_cycle_status DEFAULT 'completed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blockchain_stats (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  total_batches INTEGER DEFAULT 0,
  anchored_batches INTEGER DEFAULT 0,
  verified_batches INTEGER DEFAULT 0,
  total_votes_on_chain INTEGER DEFAULT 0,
  blockchain_network VARCHAR(50) DEFAULT NULL,
  average_anchor_time_seconds INTEGER DEFAULT NULL,
  last_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE geo_analysis_cache (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  geo_hash VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  total_votes INTEGER DEFAULT 0,
  cache_data JSONB DEFAULT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crypto_wallets (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER DEFAULT NULL,
  event_id INTEGER DEFAULT NULL,
  wallet_type VARCHAR(50) DEFAULT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  blockchain_network VARCHAR(50) DEFAULT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP DEFAULT NULL,
  balance NUMERIC(18,8) DEFAULT 0.00000000,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ip_velocity_tracking (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  vote_count INTEGER DEFAULT 0,
  first_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_blocked BOOLEAN DEFAULT FALSE,
  block_reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leaderboard_cache_control (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER DEFAULT NULL,
  last_synced_at TIMESTAMP DEFAULT NULL,
  sync_status sync_status DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incident_reports (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  severity incident_severity DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  detected_by INTEGER DEFAULT NULL,
  status incident_status DEFAULT 'open',
  resolved_by INTEGER DEFAULT NULL,
  resolved_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Group 4: Depends on categories
-- -----------------------------------------------

CREATE TABLE contestants (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  user_id INTEGER DEFAULT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  biography TEXT DEFAULT NULL,
  profile_image_url VARCHAR(512) DEFAULT NULL,
  banner_image_url VARCHAR(512) DEFAULT NULL,
  status contestant_status DEFAULT 'draft',
  verification_status verification_status DEFAULT 'unverified',
  verified_at TIMESTAMP DEFAULT NULL,
  verified_by INTEGER DEFAULT NULL,
  vote_count INTEGER DEFAULT 0,
  paid_vote_count INTEGER DEFAULT 0,
  free_vote_count INTEGER DEFAULT 0,
  total_revenue NUMERIC(12,2) DEFAULT 0.00,
  display_order INTEGER DEFAULT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  twitter_handle VARCHAR(100) DEFAULT NULL,
  instagram_handle VARCHAR(100) DEFAULT NULL,
  facebook_url VARCHAR(512) DEFAULT NULL,
  tiktok_handle VARCHAR(100) DEFAULT NULL,
  youtube_channel VARCHAR(512) DEFAULT NULL,
  website_url VARCHAR(512) DEFAULT NULL,
  linkedin_profile VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contestant_applications (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  user_id INTEGER DEFAULT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  date_of_birth DATE DEFAULT NULL,
  biography TEXT DEFAULT NULL,
  application_status application_status DEFAULT 'pending',
  rejection_reason TEXT DEFAULT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP DEFAULT NULL,
  reviewed_by INTEGER DEFAULT NULL
);

CREATE TABLE payment_limits (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER DEFAULT NULL,
  max_votes_per_user_per_day INTEGER DEFAULT 100,
  max_votes_per_user_total INTEGER DEFAULT 1000,
  max_votes_per_device_per_day INTEGER DEFAULT 50,
  max_votes_per_ip_per_hour INTEGER DEFAULT 500,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE final_results_certificates (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER DEFAULT NULL,
  certificate_hash VARCHAR(255) NOT NULL,
  merkle_root VARCHAR(255) NOT NULL,
  total_votes BIGINT DEFAULT 0,
  total_revenue NUMERIC(14,2) DEFAULT 0.00,
  generated_by INTEGER NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_finalized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Group 5: Depends on contestants
-- -----------------------------------------------

CREATE TABLE payments (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  voter_id INTEGER DEFAULT NULL,
  event_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  contestant_id INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'ETB',
  provider payment_provider DEFAULT 'telebirr',
  provider_tx_id VARCHAR(255) DEFAULT NULL,
  transaction_reference VARCHAR(255) DEFAULT NULL,
  -- Vote purchase info
  votes_purchased INTEGER DEFAULT 1,
  payer_ip VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  provider_reference VARCHAR(255) DEFAULT NULL,
  failure_reason TEXT DEFAULT NULL,
  completed_at TIMESTAMP DEFAULT NULL,
  status payment_status DEFAULT 'pending',
  payment_method VARCHAR(100) DEFAULT NULL,
  webhook_event_id INTEGER DEFAULT NULL,
  webhook_signature_valid BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verification_status payment_verification_status DEFAULT 'pending',
  verification_attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMP DEFAULT NULL,
  reconciled BOOLEAN DEFAULT FALSE,
  reconciliation_notes TEXT DEFAULT NULL,
  refund_requested BOOLEAN DEFAULT FALSE,
  refund_reason TEXT DEFAULT NULL,
  refund_amount NUMERIC(10,2) DEFAULT NULL,
  refunded_at TIMESTAMP DEFAULT NULL,
  refund_transaction_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contestant_media_gallery (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  contestant_id INTEGER NOT NULL,
  media_type media_type DEFAULT 'photo',
  media_url VARCHAR(512) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE verified_votes_cache (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  contestant_id INTEGER NOT NULL,
  verified_vote_count INTEGER DEFAULT 0,
  last_sync TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cache_valid BOOLEAN DEFAULT TRUE
);

CREATE TABLE vote_snapshots (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  contestant_id INTEGER NOT NULL,
  free_votes INTEGER DEFAULT 0,
  paid_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,
  snapshot_hash VARCHAR(255) DEFAULT NULL,
  anchored BOOLEAN DEFAULT FALSE,
  anchored_at TIMESTAMP DEFAULT NULL,
  blockchain_tx_hash VARCHAR(255) DEFAULT NULL,
  merkle_root VARCHAR(255) DEFAULT NULL,
  total_amount NUMERIC(12,2) DEFAULT 0.00,
  fraud_votes INTEGER DEFAULT 0,
  snapshot_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Group 6: Depends on payments and devices
-- -----------------------------------------------

CREATE TABLE votes (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  contestant_id INTEGER NOT NULL,
  voter_id INTEGER DEFAULT NULL,
  anonymous_voter_id VARCHAR(255) DEFAULT NULL,
  vote_type vote_type DEFAULT 'free',
  amount NUMERIC(10,2) DEFAULT 0.00,
  status vote_status DEFAULT 'pending',
  device_id INTEGER DEFAULT NULL,
  device_fingerprint_id INTEGER DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  location_id INTEGER DEFAULT NULL,
  reported_timezone VARCHAR(50) DEFAULT NULL,
  velocity_check_passed BOOLEAN DEFAULT TRUE,
  fraud_check_passed BOOLEAN DEFAULT TRUE,
  trust_score NUMERIC(3,2) DEFAULT NULL,
  fraud_risk_level fraud_risk_level DEFAULT 'low',
  anomaly_flags JSONB DEFAULT NULL,
  payment_id INTEGER DEFAULT NULL,
  payment_verified BOOLEAN DEFAULT FALSE,
  receipt_id VARCHAR(255) DEFAULT NULL,
  receipt_signature VARCHAR(1024) DEFAULT NULL,
  receipt_generated_at TIMESTAMP DEFAULT NULL,
  receipt_url VARCHAR(512) DEFAULT NULL,
  receipt_verified BOOLEAN DEFAULT FALSE,
  merkle_batch_id VARCHAR(64) DEFAULT NULL,
  vote_hash VARCHAR(64) DEFAULT NULL,
  is_signed BOOLEAN DEFAULT FALSE,
  voting_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crypto_payments (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  payment_id INTEGER NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  recipient_wallet VARCHAR(255) NOT NULL,
  blockchain_network VARCHAR(50) DEFAULT NULL,
  cryptocurrency VARCHAR(50) DEFAULT NULL,
  crypto_amount NUMERIC(18,8) DEFAULT NULL,
  exchange_rate NUMERIC(18,2) DEFAULT NULL,
  transaction_hash VARCHAR(256) DEFAULT NULL,
  confirmation_count INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 6,
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMP DEFAULT NULL,
  block_number BIGINT DEFAULT NULL,
  gas_used NUMERIC(18,8) DEFAULT NULL,
  transaction_fee NUMERIC(18,8) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refund_requests (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL,
  payment_id INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status refund_status DEFAULT 'pending',
  rejection_reason TEXT DEFAULT NULL,
  approved_by INTEGER DEFAULT NULL,
  rejected_by INTEGER DEFAULT NULL,
  approved_at TIMESTAMP DEFAULT NULL,
  rejected_at TIMESTAMP DEFAULT NULL,
  processed_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stripe_webhooks (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  stripe_webhook_id VARCHAR(255) DEFAULT NULL,
  payment_id INTEGER DEFAULT NULL,
  event_type VARCHAR(100) DEFAULT NULL,
  event_data JSONB DEFAULT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_anomalies (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  device_id INTEGER NOT NULL,
  anomaly_type VARCHAR(50) DEFAULT NULL,
  anomaly_score NUMERIC(5,2) DEFAULT NULL,
  anomaly_details JSONB DEFAULT NULL,
  is_suspicious BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_fingerprints (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  device_id INTEGER NOT NULL,
  fingerprint_hash VARCHAR(256) NOT NULL,
  canvas_fingerprint VARCHAR(256) DEFAULT NULL,
  webgl_fingerprint VARCHAR(256) DEFAULT NULL,
  audio_fingerprint VARCHAR(256) DEFAULT NULL,
  font_fingerprint VARCHAR(256) DEFAULT NULL,
  screen_resolution VARCHAR(20) DEFAULT NULL,
  timezone VARCHAR(50) DEFAULT NULL,
  language VARCHAR(10) DEFAULT NULL,
  plugins TEXT DEFAULT NULL,
  confidence_score NUMERIC(5,2) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_reputation (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  device_id INTEGER NOT NULL,
  reputation_score NUMERIC(3,2) DEFAULT 0.50,
  votes_cast INTEGER DEFAULT 0,
  fraudulent_votes INTEGER DEFAULT 0,
  last_checked TIMESTAMP DEFAULT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trust_score_history (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  device_id INTEGER NOT NULL,
  previous_score NUMERIC(3,2) DEFAULT NULL,
  new_score NUMERIC(3,2) DEFAULT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bot_pattern_detections (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  device_id INTEGER NOT NULL,
  pattern_type VARCHAR(100) DEFAULT NULL,
  detection_score NUMERIC(5,2) DEFAULT NULL,
  pattern_details JSONB DEFAULT NULL,
  is_bot_suspected BOOLEAN DEFAULT FALSE,
  confidence_level NUMERIC(3,2) DEFAULT NULL,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE performance_metrics (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  metric_name VARCHAR(100) DEFAULT NULL,
  value NUMERIC(10,2) DEFAULT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  device_id INTEGER DEFAULT NULL,
  process_name VARCHAR(100) DEFAULT NULL
);

-- -----------------------------------------------
-- Group 7: Depends on votes
-- -----------------------------------------------

CREATE TABLE vote_batches (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  batch_number INTEGER DEFAULT NULL,
  batch_size INTEGER DEFAULT 100,
  merkle_root VARCHAR(256) DEFAULT NULL,
  batch_hash VARCHAR(256) DEFAULT NULL,
  parent_batch_id INTEGER DEFAULT NULL,
  total_votes INTEGER DEFAULT 0,
  status batch_status DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP DEFAULT NULL,
  verified_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE vote_receipts (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_id INTEGER NOT NULL,
  receipt_number VARCHAR(100) NOT NULL,
  voter_email VARCHAR(255) DEFAULT NULL,
  voter_phone VARCHAR(20) DEFAULT NULL,
  event_name VARCHAR(255) DEFAULT NULL,
  category_name VARCHAR(255) DEFAULT NULL,
  contestant_name VARCHAR(255) DEFAULT NULL,
  amount NUMERIC(10,2) DEFAULT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  receipt_hash VARCHAR(256) DEFAULT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_timestamp TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vote_locations (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_id INTEGER NOT NULL,
  latitude NUMERIC(10,8) DEFAULT NULL,
  longitude NUMERIC(11,8) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  country_code VARCHAR(2) DEFAULT NULL,
  state_province VARCHAR(100) DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  zip_code VARCHAR(10) DEFAULT NULL,
  accuracy_radius INTEGER DEFAULT NULL,
  is_vpn BOOLEAN DEFAULT FALSE,
  is_proxy BOOLEAN DEFAULT FALSE,
  is_tor BOOLEAN DEFAULT FALSE,
  location_source VARCHAR(50) DEFAULT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vote_merkle_hashes (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  batch_id INTEGER NOT NULL,
  vote_id INTEGER NOT NULL,
  vote_hash VARCHAR(64) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vote_behavior_profiles (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  device_id INTEGER NOT NULL,
  average_vote_interval_seconds INTEGER DEFAULT 0,
  night_vote_ratio NUMERIC(5,2) DEFAULT 0.00,
  country_switch_count INTEGER DEFAULT 0,
  risk_score NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anomaly_detection_history (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_id INTEGER NOT NULL,
  anomaly_type VARCHAR(100) DEFAULT NULL,
  anomaly_score NUMERIC(5,2) DEFAULT NULL,
  flagged_reason TEXT DEFAULT NULL,
  action_taken VARCHAR(100) DEFAULT NULL,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fraud_logs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER DEFAULT NULL,
  category_id INTEGER DEFAULT NULL,
  vote_id INTEGER DEFAULT NULL,
  device_id INTEGER DEFAULT NULL,
  user_id INTEGER DEFAULT NULL,
  fraud_type VARCHAR(100) DEFAULT NULL,
  severity fraud_severity DEFAULT 'medium',
  description TEXT DEFAULT NULL,
  evidence JSONB DEFAULT NULL,
  action_taken VARCHAR(100) DEFAULT NULL,
  action_timestamp TIMESTAMP DEFAULT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_vote_reconciliation (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  payment_id INTEGER NOT NULL,
  vote_id INTEGER NOT NULL,
  reconciled BOOLEAN DEFAULT FALSE,
  reconciliation_notes TEXT DEFAULT NULL,
  amount_paid NUMERIC(10,2) DEFAULT NULL,
  amount_received NUMERIC(10,2) DEFAULT NULL,
  discrepancy NUMERIC(10,2) DEFAULT NULL,
  reconciled_at TIMESTAMP DEFAULT NULL,
  reconciled_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_vote_mismatches (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  payment_id INTEGER NOT NULL,
  expected_votes INTEGER NOT NULL,
  actual_votes INTEGER NOT NULL,
  mismatch_reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE geographic_velocity_logs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_id INTEGER NOT NULL,
  device_id INTEGER NOT NULL,
  previous_location_country VARCHAR(100) DEFAULT NULL,
  previous_location_city VARCHAR(100) DEFAULT NULL,
  previous_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  current_location_country VARCHAR(100) DEFAULT NULL,
  current_location_city VARCHAR(100) DEFAULT NULL,
  "current_timestamp" TIMESTAMP DEFAULT NULL,
  distance_km NUMERIC(10,2) DEFAULT NULL,
  time_difference_seconds INTEGER DEFAULT NULL,
  speed_kmh NUMERIC(10,2) DEFAULT NULL,
  is_impossible BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE timezone_anomalies (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_id INTEGER NOT NULL,
  device_id INTEGER NOT NULL,
  reported_timezone VARCHAR(50) DEFAULT NULL,
  actual_timezone VARCHAR(50) DEFAULT NULL,
  offset_hours INTEGER DEFAULT NULL,
  anomaly_score NUMERIC(5,2) DEFAULT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vpn_detections (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_id INTEGER NOT NULL,
  device_id INTEGER NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  vpn_provider VARCHAR(100) DEFAULT NULL,
  detection_confidence NUMERIC(3,2) DEFAULT NULL,
  is_vpn_confirmed BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE velocity_violations (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  device_id INTEGER NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  vote_count INTEGER DEFAULT 0,
  time_window_seconds INTEGER DEFAULT 300,
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  severity velocity_severity DEFAULT 'medium',
  is_fraud BOOLEAN DEFAULT FALSE
);

-- -----------------------------------------------
-- Group 8: Depends on fraud_logs, vote_batches, etc.
-- -----------------------------------------------

CREATE TABLE fraud_alerts (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  fraud_log_id INTEGER NOT NULL,
  alert_type VARCHAR(50) DEFAULT NULL,
  alert_message TEXT DEFAULT NULL,
  alert_level fraud_alert_level DEFAULT 'warning',
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by INTEGER DEFAULT NULL,
  acknowledged_at TIMESTAMP DEFAULT NULL,
  action_required VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alerts_triggered (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  alert_rule_id INTEGER NOT NULL,
  trigger_value NUMERIC(10,2) DEFAULT NULL,
  triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by INTEGER DEFAULT NULL,
  acknowledged_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE blockchain_anchors (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  batch_id INTEGER NOT NULL,
  blockchain_network VARCHAR(50) DEFAULT NULL,
  blockchain_tx_hash VARCHAR(256) DEFAULT NULL,
  blockchain_block_number BIGINT DEFAULT NULL,
  merkle_root_on_chain VARCHAR(256) DEFAULT NULL,
  timestamp_on_chain BIGINT DEFAULT NULL,
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmation_count INTEGER DEFAULT 0,
  anchor_url VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE blockchain_audit_log (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  batch_id INTEGER NOT NULL,
  action VARCHAR(100) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  status blockchain_status_enum DEFAULT 'pending',
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blockchain_job_queue (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  job_type VARCHAR(100) DEFAULT NULL,
  job_data JSONB DEFAULT NULL,
  status job_status DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP DEFAULT NULL,
  completed_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE merkle_proofs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_id INTEGER NOT NULL,
  batch_id INTEGER NOT NULL,
  merkle_path JSONB NOT NULL,
  proof_hash VARCHAR(256) DEFAULT NULL,
  leaf_index INTEGER DEFAULT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipt_verifications (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  vote_receipt_id INTEGER NOT NULL,
  verification_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_valid BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(100) DEFAULT NULL,
  verification_details JSONB DEFAULT NULL,
  verified_by VARCHAR(100) DEFAULT NULL
);

-- -----------------------------------------------
-- Group 9: Depends on merkle_proofs
-- -----------------------------------------------

CREATE TABLE merkle_proof_verifications (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  merkle_proof_id INTEGER NOT NULL,
  verification_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_valid BOOLEAN DEFAULT FALSE,
  verification_method VARCHAR(100) DEFAULT NULL,
  verification_details JSONB DEFAULT NULL,
  verified_by VARCHAR(100) DEFAULT NULL
);

-- -----------------------------------------------
-- Standalone tables
-- -----------------------------------------------

CREATE TABLE webhook_events (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  external_event_id VARCHAR(255) DEFAULT NULL,
  payload JSONB NOT NULL,
  status webhook_status DEFAULT 'received',
  processed_at TIMESTAMP DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_attempts (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  webhook_event_id INTEGER NOT NULL,
  attempt_number INTEGER DEFAULT NULL,
  endpoint_url VARCHAR(512) DEFAULT NULL,
  http_status_code INTEGER DEFAULT NULL,
  response_time_ms INTEGER DEFAULT NULL,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_failures (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  webhook_event_id INTEGER NOT NULL,
  endpoint_url VARCHAR(512) DEFAULT NULL,
  http_status_code INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  request_payload JSONB DEFAULT NULL,
  response_payload JSONB DEFAULT NULL,
  retry_attempt INTEGER DEFAULT 1,
  next_retry_at TIMESTAMP DEFAULT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_signature_logs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  webhook_event_id INTEGER NOT NULL,
  signature_algorithm VARCHAR(50) DEFAULT NULL,
  signature_value VARCHAR(512) DEFAULT NULL,
  signature_valid BOOLEAN DEFAULT FALSE,
  validation_method VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_audit (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  provider webhook_provider NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  audit_type webhook_audit_type NOT NULL,
  status webhook_event_status DEFAULT 'success',
  details JSONB DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_rate_limit (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  provider webhook_provider NOT NULL,
  processed_count INTEGER DEFAULT 1,
  period_start TIMESTAMP DEFAULT NULL,
  period_end TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_secrets (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  provider webhook_provider NOT NULL,
  secret_key_hash VARCHAR(64) NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  rotated_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suspicious_ip_reputation (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  ip_address VARCHAR(45) DEFAULT NULL,
  reputation_score NUMERIC(5,2) DEFAULT NULL,
  threat_level ip_threat_level DEFAULT 'low',
  is_blacklisted BOOLEAN DEFAULT FALSE,
  fraud_reports INTEGER DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vpn_ip_database (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  ip_address VARCHAR(45) DEFAULT NULL,
  vpn_provider VARCHAR(100) DEFAULT NULL,
  country VARCHAR(100) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_usage (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  endpoint VARCHAR(255) DEFAULT NULL,
  method VARCHAR(10) DEFAULT NULL,
  status_code INTEGER DEFAULT NULL,
  response_time INTEGER DEFAULT NULL,
  request_size INTEGER DEFAULT NULL,
  response_size INTEGER DEFAULT NULL,
  user_id INTEGER DEFAULT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monitoring_metrics (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  metric_name VARCHAR(255) NOT NULL,
  metric_value NUMERIC(18,4) DEFAULT 0.0000,
  source VARCHAR(100) DEFAULT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_events (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_type VARCHAR(100) DEFAULT NULL,
  severity system_event_severity DEFAULT 'info',
  source VARCHAR(100) DEFAULT NULL,
  details TEXT DEFAULT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE db_health_checks (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  check_type VARCHAR(100) DEFAULT NULL,
  status db_health_status DEFAULT 'healthy',
  response_time INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL,
  checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  config_key VARCHAR(255) NOT NULL,
  config_value TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  is_sensitive BOOLEAN DEFAULT FALSE,
  updated_by INTEGER DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feature_flags (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  feature_name VARCHAR(255) NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0,
  environment feature_environment DEFAULT 'production',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shard_registry (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  shard_name VARCHAR(255) NOT NULL,
  database_host VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rate_limit_logs (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id INTEGER DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  endpoint VARCHAR(255) DEFAULT NULL,
  request_count INTEGER DEFAULT NULL,
  limit_exceeded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  action_taken VARCHAR(100) DEFAULT NULL
);

CREATE TABLE app_settings (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  key VARCHAR(100) NOT NULL,
  value TEXT DEFAULT NULL,
  category app_settings_category NOT NULL DEFAULT 'general',
  description VARCHAR(255) DEFAULT NULL,
  is_editable BOOLEAN DEFAULT TRUE,
  updated_by INTEGER DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE geo_risk_profiles (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,
  risk_score NUMERIC(5,2) DEFAULT 0.00,
  max_votes_per_hour INTEGER DEFAULT 10000,
  max_devices_per_ip INTEGER DEFAULT 5,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rsa_key_versions (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  version INTEGER DEFAULT NULL,
  public_key TEXT NOT NULL,
  private_key TEXT DEFAULT NULL,
  key_algorithm VARCHAR(20) DEFAULT 'RSA-2048',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE payment_providers (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  provider_name VARCHAR(100) NOT NULL,
  provider_code VARCHAR(50) NOT NULL,
  api_key VARCHAR(512) DEFAULT NULL,
  secret_key VARCHAR(512) DEFAULT NULL,
  webhook_url VARCHAR(512) DEFAULT NULL,
  webhook_secret VARCHAR(512) DEFAULT NULL,
  environment payment_provider_env DEFAULT 'test',
  status payment_provider_status DEFAULT 'inactive',
  min_amount NUMERIC(10,2) DEFAULT 0.01,
  max_amount NUMERIC(12,2) DEFAULT 999999.99,
  fee_percentage NUMERIC(5,2) DEFAULT 0.00,
  fee_fixed NUMERIC(10,2) DEFAULT 0.00,
  supported_currencies JSONB DEFAULT NULL,
  supported_countries JSONB DEFAULT NULL,
  config_data JSONB DEFAULT NULL,
  last_tested TIMESTAMP DEFAULT NULL,
  test_result VARCHAR(255) DEFAULT NULL,
  enabled_for_events JSONB DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sponsor_partners (
  id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(512) DEFAULT NULL,
  website_url VARCHAR(512) DEFAULT NULL,
  tier sponsor_tier DEFAULT 'bronze',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SECTION 3: INDEXES (Performance & Uniqueness)
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_categories_event_id ON categories(event_id);
CREATE INDEX idx_contestants_event_id ON contestants(event_id);
CREATE INDEX idx_contestants_category_id ON contestants(category_id);
CREATE INDEX idx_contestants_status ON contestants(status);
CREATE INDEX idx_payments_voter_id ON payments(voter_id);
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_votes_event_id ON votes(event_id);
CREATE INDEX idx_votes_category_id ON votes(category_id);
CREATE INDEX idx_votes_contestant_id ON votes(contestant_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_device_id ON votes(device_id);
CREATE INDEX idx_votes_status ON votes(status);
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_fingerprint ON devices(device_fingerprint);
CREATE INDEX idx_devices_ip_address ON devices(ip_address);
CREATE INDEX idx_fraud_logs_vote_id ON fraud_logs(vote_id);
CREATE INDEX idx_vote_batches_event_id ON vote_batches(event_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);

-- =====================================================
-- SECTION 4: UNIQUE CONSTRAINTS
-- =====================================================

ALTER TABLE app_settings ADD CONSTRAINT uq_app_settings_key UNIQUE (key);
ALTER TABLE system_settings ADD CONSTRAINT uq_system_settings_config_key UNIQUE (config_key);
ALTER TABLE feature_flags ADD CONSTRAINT uq_feature_flags_name UNIQUE (feature_name);
ALTER TABLE shard_registry ADD CONSTRAINT uq_shard_registry_name UNIQUE (shard_name);
ALTER TABLE payment_providers ADD CONSTRAINT uq_payment_providers_name UNIQUE (provider_name);
ALTER TABLE payment_providers ADD CONSTRAINT uq_payment_providers_code UNIQUE (provider_code);
ALTER TABLE geo_risk_profiles ADD CONSTRAINT uq_geo_risk_profiles_country UNIQUE (country_code);
ALTER TABLE vote_receipts ADD CONSTRAINT uq_vote_receipts_number UNIQUE (receipt_number);

-- =====================================================
-- SECTION 5: SEED DATA
-- =====================================================

INSERT INTO users (id, email, username, password_hash, first_name, last_name, role, status) VALUES
(1, 'admin@votechain.com', 'admin', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Admin', 'User', 'admin'::user_role, 'active'::user_status),
(2, 'contestant@votechain.com', 'contestant1', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Contestant', 'One', 'contestant'::user_role, 'active'::user_status),
(3, 'voter1@votechain.com', 'voter1', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Voter', 'One', 'voter'::user_role, 'active'::user_status),
(4, 'voter2@votechain.com', 'voter2', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Voter', 'Two', 'voter'::user_role, 'active'::user_status),
(5, 'media@votechain.com', 'media', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Media', 'User', 'media'::user_role, 'active'::user_status),
(6, 'observer@votechain.com', 'observer', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Observer', 'User', 'observer'::user_role, 'active'::user_status),
(7, 'transparency@votechain.com', 'transparency', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Transparency', 'Officer', 'transparency'::user_role, 'active'::user_status),
(8, 'voter3@votechain.com', 'voter3', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Voter', 'Three', 'voter'::user_role, 'active'::user_status),
(9, 'contestant2@votechain.com', 'contestant2', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Contestant', 'Two', 'contestant'::user_role, 'active'::user_status),
(10, 'voter4@votechain.com', 'voter4', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Voter', 'Four', 'voter'::user_role, 'active'::user_status);

INSERT INTO app_settings (key, value, category, description, is_editable) VALUES
('DAILY_VOTE_LIMIT_PER_CATEGORY', '50', 'voting'::app_settings_category, 'Maximum paid votes per user per category per day', true),
('DAILY_VOTE_LIMIT_TOTAL', '100', 'voting'::app_settings_category, 'Maximum total paid votes per user per day', true),
('EVENT_VOTE_LIMIT', '1000', 'voting'::app_settings_category, 'Maximum total votes per user per event', true),
('FREE_VOTES_PER_CATEGORY', '1', 'voting'::app_settings_category, 'Free votes allowed per category', true),
('PAID_VOTES_PER_PURCHASE', '5', 'voting'::app_settings_category, 'How many votes user gets per payment', true),
('DAILY_SPENDING_CAP', '500', 'payment'::app_settings_category, 'Maximum amount user can spend per day (USD)', true),
('MIN_PAYMENT_AMOUNT', '5', 'payment'::app_settings_category, 'Minimum payment amount (USD)', true),
('MAX_PAYMENT_AMOUNT', '1000', 'payment'::app_settings_category, 'Maximum payment amount (USD)', true),
('ENABLE_BLOCKCHAIN', 'false', 'feature'::app_settings_category, 'Enable blockchain verification features', true),
('ENABLE_2FA', 'false', 'feature'::app_settings_category, 'Enable two-factor authentication', true),
('ENABLE_EMAIL_VERIFICATION', 'true', 'feature'::app_settings_category, 'Require email verification', true),
('ENABLE_REFUNDS', 'true', 'feature'::app_settings_category, 'Enable refund request feature', true),
('ENABLE_FRAUD_DETECTION', 'true', 'feature'::app_settings_category, 'Enable automatic fraud detection', true),
('MAINTENANCE_MODE', 'false', 'feature'::app_settings_category, 'Put site in maintenance mode', true),
('APP_NAME', 'VoteChain', 'general'::app_settings_category, 'Application name displayed to users', true),
('APP_DESCRIPTION', 'Secure Blockchain-Based Voting Platform', 'general'::app_settings_category, 'Application description', true),
('SUPPORT_EMAIL', 'support@votechain.com', 'general'::app_settings_category, 'Support contact email', true),
('SUPPORT_PHONE', '+1-500-VOTE-CHAIN', 'general'::app_settings_category, 'Support phone number', true);

INSERT INTO events (name, slug, status, season, start_date, end_date, voting_start, voting_end, creator_id) VALUES
('Innovation Awards 2026', 'innovation-awards-2026', 'active'::event_status, 2026, '2026-02-01'::timestamp, '2026-03-01'::timestamp, '2026-02-05'::timestamp, '2026-02-28'::timestamp, 1),
('Community Impact Awards', 'community-impact-awards', 'active'::event_status, 2026, '2026-02-15'::timestamp, '2026-03-15'::timestamp, '2026-02-20'::timestamp, '2026-03-10'::timestamp, 1),
('Youth Excellence Awards', 'youth-excellence-awards', 'draft'::event_status, 2026, '2026-03-01'::timestamp, '2026-04-01'::timestamp, '2026-03-10'::timestamp, '2026-03-31'::timestamp, 1),
('Tech Innovation Summit 2026', 'tech-innovation-summit-2026', 'active'::event_status, 2026, '2026-02-01'::timestamp, '2026-03-15'::timestamp, '2026-02-10'::timestamp, '2026-03-14'::timestamp, 1);

INSERT INTO categories (event_id, name, description, category_order) VALUES
(1, 'Technology Innovation', 'Breakthrough technological innovations and solutions', 0),
(1, 'Sustainability', 'Environmental and sustainability initiatives', 1),
(1, 'Youth Development', 'Programs empowering youth and education', 2),
(2, 'Community Service', 'Outstanding community service and volunteerism', 0),
(2, 'Healthcare Innovation', 'Innovations in healthcare and wellness', 1),
(4, 'AI & Machine Learning', 'Artificial Intelligence solutions', 0),
(4, 'Cloud Computing', 'Cloud infrastructure and services', 1),
(4, 'Cybersecurity', 'Security and privacy solutions', 2);

INSERT INTO contestants (event_id, category_id, first_name, last_name, email, status, vote_count, paid_vote_count, free_vote_count, total_revenue) VALUES
(1, 1, 'TechVision', 'Corp', 'info@techvision.com', 'approved'::contestant_status, 2348, 0, 0, 0.00),
(1, 1, 'Innovation Lab', 'XYZ', 'contact@innovationlab.com', 'approved'::contestant_status, 451, 0, 0, 0.00),
(1, 1, 'Smart Solutions', 'Inc', 'hello@smartsolutions.com', 'approved'::contestant_status, 1284, 0, 0, 0.00),
(1, 2, 'GreenEnergy', 'Solutions', 'info@greenenergy.com', 'approved'::contestant_status, 1892, 0, 0, 0.00),
(1, 2, 'EcoTech', 'Innovations', 'contact@ecotech.com', 'approved'::contestant_status, 923, 0, 0, 0.00),
(1, 2, 'CleanFuture', 'Foundation', 'info@cleanfuture.org', 'approved'::contestant_status, 678, 0, 0, 0.00),
(1, 3, 'Future Leaders', 'Org', 'info@futureleaders.org', 'approved'::contestant_status, 2981, 0, 0, 0.00),
(1, 3, 'EduTech', 'Academy', 'contact@edutech.com', 'approved'::contestant_status, 1567, 0, 0, 0.00),
(1, 3, 'Youth Innovators', 'Network', 'hello@youthinnovators.org', 'approved'::contestant_status, 876, 0, 0, 0.00),
(2, 4, 'Helping Hands', 'Foundation', 'info@helpinghands.org', 'approved'::contestant_status, 1456, 0, 0, 0.00),
(2, 4, 'Neighbors United', 'Initiative', 'contact@neighborsunited.org', 'approved'::contestant_status, 987, 0, 0, 0.00),
(2, 5, 'HealthTech', 'Solutions', 'info@healthtech.com', 'approved'::contestant_status, 1765, 0, 0, 0.00),
(2, 5, 'MedInnovate', 'Labs', 'contact@medinnovate.com', 'approved'::contestant_status, 1234, 0, 0, 0.00),
(4, 6, 'AI Solutions', 'Startup', 'hello@aisolutions.ai', 'approved'::contestant_status, 567, 400, 167, 4000.00),
(4, 7, 'Cloud Systems', 'Provider', 'info@cloudsystems.io', 'approved'::contestant_status, 234, 150, 84, 1500.00),
(4, 8, 'SecureNet', 'Security', 'contact@securenet.com', 'approved'::contestant_status, 189, 100, 89, 1000.00);

-- =====================================================
-- SECTION 6: TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION audit_contestant_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO audit_logs (action, entity_type, entity_id, changes, created_at)
    VALUES ('status_changed', 'contestant', NEW.id, 
            jsonb_build_object('old_status', OLD.status::text, 'new_status', NEW.status::text), 
            CURRENT_TIMESTAMP);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_contestant_status_change ON contestants;
CREATE TRIGGER audit_contestant_status_change
AFTER UPDATE ON contestants
FOR EACH ROW
EXECUTE FUNCTION audit_contestant_status_change();

-- =====================================================
-- SECTION 7: VIEWS (Converted from MySQL)
-- =====================================================

-- View: blockchain_anchor_status
CREATE OR REPLACE VIEW blockchain_anchor_status AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    bs.blockchain_network AS blockchain_network,
    COUNT(DISTINCT vb.id) AS total_batches,
    SUM(CASE WHEN ba.is_confirmed = TRUE THEN 1 ELSE 0 END)::BIGINT AS confirmed_anchors,
    COUNT(DISTINCT ba.id)::BIGINT AS total_anchors,
    AVG(EXTRACT(EPOCH FROM (ba.created_at - vb.created_at)))::NUMERIC(24,4) AS avg_time_to_anchor
FROM events e
LEFT JOIN vote_batches vb ON vb.event_id = e.id
LEFT JOIN blockchain_anchors ba ON ba.batch_id = vb.id
LEFT JOIN blockchain_stats bs ON bs.event_id = e.id
GROUP BY e.id, e.name, bs.blockchain_network;

-- View: crypto_health_check
CREATE OR REPLACE VIEW crypto_health_check AS
SELECT 'RSA Keys' AS component, 
    COUNT(CASE WHEN is_active THEN 1 ELSE 0 END) AS active_count, 
    COUNT(0) AS total_count, 
    MAX(created_at) AS last_created 
FROM rsa_key_versions
UNION ALL
SELECT 'Vote Receipts' AS component,
    COUNT(CASE WHEN is_verified THEN 1 ELSE 0 END) AS active_count,
    COUNT(0) AS total_count,
    MAX(created_at) AS last_created
FROM vote_receipts;

-- View: device_reputation_summary
CREATE OR REPLACE VIEW device_reputation_summary AS
SELECT 
    d.id,
    d.device_fingerprint,
    d.device_name,
    dr.reputation_score,
    dr.votes_cast,
    dr.fraudulent_votes,
    COUNT(DISTINCT f.id) AS fraud_reports,
    MAX(f.created_at) AS last_fraud_report
FROM devices d
LEFT JOIN device_reputation dr ON dr.device_id = d.id
LEFT JOIN fraud_logs f ON f.device_id = d.id
GROUP BY d.id, d.device_fingerprint, d.device_name, dr.reputation_score, dr.votes_cast, dr.fraudulent_votes;

-- View: fraud_detection_summary
CREATE OR REPLACE VIEW fraud_detection_summary AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    COUNT(DISTINCT f.id)::BIGINT AS total_fraud_reports,
    SUM(CASE WHEN f.severity = 'critical' THEN 1 ELSE 0 END)::NUMERIC(22,0) AS critical_cases,
    SUM(CASE WHEN f.severity = 'high' THEN 1 ELSE 0 END)::NUMERIC(22,0) AS high_cases,
    SUM(CASE WHEN f.is_resolved = TRUE THEN 1 ELSE 0 END)::NUMERIC(22,0) AS resolved_cases,
    SUM(CASE WHEN f.is_resolved = FALSE THEN 1 ELSE 0 END)::NUMERIC(22,0) AS pending_cases
FROM events e
LEFT JOIN fraud_logs f ON f.event_id = e.id
GROUP BY e.id, e.name;

-- View: geographic_vote_distribution
CREATE OR REPLACE VIEW geographic_vote_distribution AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    vl.country,
    vl.country_code,
    vl.city,
    COUNT(v.id)::BIGINT AS vote_count,
    COUNT(DISTINCT d.id)::BIGINT AS unique_devices,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END)::NUMERIC(32,2) AS total_revenue
FROM events e
LEFT JOIN votes v ON e.id = v.event_id
LEFT JOIN vote_locations vl ON vl.vote_id = v.id
LEFT JOIN devices d ON d.id = v.device_id
LEFT JOIN payments p ON p.id = v.payment_id
GROUP BY e.id, e.name, vl.country, vl.country_code, vl.city;

-- View: merkle_batch_status
CREATE OR REPLACE VIEW merkle_batch_status AS
SELECT 
    vb.batch_number AS batch_id,
    vb.event_id,
    vb.batch_size AS vote_count,
    vb.merkle_root,
    vb.batch_hash AS batch_hash,
    vb.status AS status,
    vb.total_votes,
    vb.created_at,
    vb.closed_at,
    COUNT(vmh.id)::BIGINT AS hash_count
FROM vote_batches vb
LEFT JOIN vote_merkle_hashes vmh ON vmh.batch_id = vb.id
GROUP BY vb.batch_number, vb.event_id, vb.batch_size, vb.merkle_root, vb.batch_hash, vb.status, vb.total_votes, vb.created_at, vb.closed_at;

-- View: payment_status_overview
CREATE OR REPLACE VIEW payment_status_overview AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    p.provider,
    COUNT(p.id)::BIGINT AS total_payments,
    SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END)::NUMERIC(32,2) AS completed_amount,
    SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END)::NUMERIC(32,2) AS pending_amount,
    SUM(CASE WHEN p.status = 'failed' THEN 1 ELSE 0 END)::BIGINT AS failed_count,
    AVG(p.amount)::NUMERIC(10,2) AS average_amount
FROM events e
LEFT JOIN payments p ON p.event_id = e.id
GROUP BY e.id, e.name, p.provider;

-- View: real_time_leaderboard
CREATE OR REPLACE VIEW real_time_leaderboard AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    ct.id AS category_id,
    ct.name AS category_name,
    c.id AS contestant_id,
    c.first_name,
    c.last_name,
    c.profile_image_url,
    COUNT(v.id)::BIGINT AS vote_count,
    SUM(CASE WHEN v.vote_type = 'paid' THEN v.amount ELSE 0 END)::NUMERIC(32,2) AS total_revenue,
    ROW_NUMBER() OVER (PARTITION BY e.id, ct.id ORDER BY COUNT(v.id) DESC)::BIGINT AS rank
FROM events e
JOIN categories ct ON ct.event_id = e.id
JOIN contestants c ON c.category_id = ct.id
LEFT JOIN votes v ON v.contestant_id = c.id AND v.status = 'valid'
GROUP BY e.id, e.name, ct.id, ct.name, c.id, c.first_name, c.last_name, c.profile_image_url;

-- View: receipt_verification_summary
CREATE OR REPLACE VIEW receipt_verification_summary AS
SELECT 
    CAST(vr.verification_timestamp AS DATE) AS verification_date,
    COUNT(0)::BIGINT AS total_verifications,
    SUM(CASE WHEN vr.is_valid = TRUE THEN 1 ELSE 0 END)::NUMERIC(22,0) AS valid_count,
    SUM(CASE WHEN vr.is_valid = FALSE THEN 1 ELSE 0 END)::NUMERIC(22,0) AS invalid_count,
    COUNT(DISTINCT vr.verified_by)::BIGINT AS unique_verifiers
FROM receipt_verifications vr
GROUP BY CAST(vr.verification_timestamp AS DATE);

-- View: system_health_overview
CREATE OR REPLACE VIEW system_health_overview AS
SELECT 
    COUNT(CASE WHEN status = 'healthy' THEN 1 END)::BIGINT AS healthy_checks,
    COUNT(CASE WHEN status = 'warning' THEN 1 END)::BIGINT AS warning_checks,
    COUNT(CASE WHEN status = 'critical' THEN 1 END)::BIGINT AS critical_checks,
    MAX(checked_at) AS last_health_check
FROM db_health_checks;

-- View: user_activity_summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    u.id,
    u.email,
    u.role,
    COUNT(DISTINCT v.id)::BIGINT AS votes_cast,
    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0)::NUMERIC(32,2) AS total_spent,
    MAX(u.last_login) AS last_login,
    COUNT(DISTINCT aal.id)::BIGINT AS account_events
FROM users u
LEFT JOIN votes v ON u.id = v.voter_id AND v.status IN ('valid', 'pending')
LEFT JOIN payments p ON p.voter_id = u.id
LEFT JOIN account_audit_logs aal ON aal.user_id = u.id
GROUP BY u.id, u.email, u.role;

-- View: velocity_violation_trends
CREATE OR REPLACE VIEW velocity_violation_trends AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    vv.detected_at::DATE AS violation_date,
    COUNT(vv.id)::BIGINT AS violation_count,
    COUNT(DISTINCT vv.device_id)::BIGINT AS affected_devices,
    SUM(CASE WHEN vv.is_fraud = TRUE THEN 1 ELSE 0 END)::BIGINT AS confirmed_fraud_cases
FROM events e
LEFT JOIN velocity_violations vv ON e.id = vv.event_id
GROUP BY e.id, e.name, vv.detected_at::DATE;

-- View: vote_counts_by_contestant
CREATE OR REPLACE VIEW vote_counts_by_contestant AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.event_id,
    c.category_id,
    COUNT(CASE WHEN v.vote_type = 'free' THEN 1 END)::BIGINT AS free_votes,
    COUNT(CASE WHEN v.vote_type = 'paid' THEN 1 END)::BIGINT AS paid_votes,
    COUNT(v.id)::BIGINT AS total_votes,
    SUM(CASE WHEN v.vote_type = 'paid' THEN v.amount ELSE 0 END)::NUMERIC(32,2) AS total_revenue
FROM contestants c
LEFT JOIN votes v ON v.contestant_id = c.id
GROUP BY c.id, c.first_name, c.last_name, c.event_id, c.category_id;

-- View: v_suspicious_ips_24h
CREATE OR REPLACE VIEW v_suspicious_ips_24h AS
SELECT 
    ip_address,
    reputation_score,
    threat_level,
    is_blacklisted,
    fraud_reports,
    last_updated
FROM suspicious_ip_reputation
WHERE last_updated >= NOW() - INTERVAL '24 hours';

-- View: v_user_trusted_devices
CREATE OR REPLACE VIEW v_user_trusted_devices AS
SELECT 
    device_id AS user_id,
    COUNT(0)::BIGINT AS device_count,
    MAX(created_at) AS last_access,
    COUNT(CASE WHEN confidence_score >= 80 THEN 1 END)::BIGINT AS trusted_count
FROM device_fingerprints
GROUP BY device_id;

COMMIT;

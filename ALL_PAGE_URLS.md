# Complete URL Guide - All Pages

This document lists all available pages/routes in the voting platform.

## Authentication Pages (No Login Required)

### Login & Auth
- `/login` - Login page with all demo credentials
- `/signup` - Sign up page
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page
- `/verify` - Email verification page
- `/verify-phone` - Phone verification page

## Public Pages (No Login Required)

### Main Pages
- `/` - Home page (redirects to appropriate dashboard based on auth status)
- `/events` - Browse all events
- `/how-it-works` - How the platform works
- `/notifications` - Notifications center

### Event Pages
- `/event/[slug]` - Event details (public view)
- `/event/[slug]/contestant/[contestantSlug]` - Contestant profile (public view)
- `/event/[slug]/contestant/[contestantSlug]/vote` - Vote for contestant (public)
- `/events/[eventSlug]` - Event details with full info
- `/events/[eventSlug]/page` - Event page
- `/events/[eventSlug]/categories` - Event categories
- `/events/[eventSlug]/contestant/[contestantSlug]` - Contestant details
- `/events/[eventSlug]/contestant/[contestantSlug]/vote` - Vote page
- `/events/[eventSlug]/leaderboard` - Event leaderboard
- `/events/[eventSlug]/results` - Event results
- `/events/archive` - Archived events

### Results & Leaderboard
- `/results/[eventId]` - Results page
- `/leaderboard/[eventId]` - Leaderboard page
- `/category/[categoryId]` - Category page

### Information Pages
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/transparency` - Transparency report
- `/refund-policy` - Refund policy

### Receipt & Verification
- `/receipt/[receiptNumber]` - Receipt verification
- `/verify/[receiptNumber]` - Receipt verification (alternative)

### Error & Status Pages
- `/access-denied` - Access denied page
- `/account-locked` - Account locked page
- `/session-expired` - Session expired page
- `/maintenance` - Maintenance mode
- `/anti-fraud` - Anti-fraud alert

## Protected Pages (Require Login)

### Profile Pages
- `/profile` - User profile
- `/profile/edit` - Edit profile
- `/profile/security` - Security settings
- `/profile/settings` - Profile settings

### Vote-Related
- `/vote/checkout` - Vote checkout page

## Admin Dashboard (Admin Role Only)

### Main Dashboard
- `/admin` - Admin home redirect
- `/admin/page` - Admin main page
- `/admin/dashboard` - Admin dashboard
- `/admin/dashboard-enhanced` - Enhanced admin dashboard

### Admin Management Pages
- `/admin/analytics` - Analytics dashboard
- `/admin/announcements` - Announcements management
- `/admin/audit-logs` - Audit logs
- `/admin/blockchain` - Blockchain info
- `/admin/cache` - Cache management
- `/admin/categories` - Category management
- `/admin/contestants` - Contestant management
- `/admin/events` - Event management
- `/admin/feature-flags` - Feature flags
- `/admin/fraud` - Fraud detection
- `/admin/health` - Health check
- `/admin/health-check` - Health check (alternative)
- `/admin/jobs` - Job management
- `/admin/moderation` - Moderation queue
- `/admin/notifications` - Notification management
- `/admin/payments` - Payment management
- `/admin/reports` - Reports
- `/admin/settings` - Admin settings
- `/admin/users` - User management
- `/admin/votes` - Vote management
- `/admin/emergency-controls` - Emergency controls

## Contestant Dashboard (Contestant Role Only)

- `/events/contestant/dashboard` - Contestant dashboard
- `/events/contestant/page` - Contestant page
- `/events/contestant/analytics` - Analytics
- `/events/contestant/event` - Event info
- `/events/contestant/geographic` - Geographic stats
- `/events/contestant/notifications` - Notifications
- `/events/contestant/ranking` - Ranking info
- `/events/contestant/revenue` - Revenue info
- `/events/contestant/security` - Security settings
- `/events/contestant/sponsors` - Sponsors info

## Media Dashboard (Media Role Only)

- `/media` - Media main page
- `/media/page` - Media page
- `/media/dashboard` - Media dashboard
- `/media/analytics` - Media analytics
- `/media/blockchain` - Blockchain info
- `/media/exports` - Export data
- `/media/fraud` - Fraud analytics
- `/media/geographic` - Geographic data
- `/media/leaderboard` - Leaderboard view
- `/media/notifications` - Notifications

## Voter Dashboard (Voter Role Only)

- `/voter/dashboard` - Voter dashboard
- `/voter/my-votes` - My votes page
- `/voter/payments` - Payment history
- `/voter/settings` - Voter settings

---

## Demo Credentials

### Admin
- Email: `admin@votingplatform.com`
- Password: `Admin@123456`

### Contestants (3 accounts)
- Email: `contestant@example.com` | Password: `Contestant@123456`
- Email: `maria.garcia@example.com` | Password: `Contestant@123456`
- Email: `alex.chen@example.com` | Password: `Contestant@123456`

### Media (2 accounts)
- Email: `media@example.com` | Password: `Media@123456`
- Email: `press@example.com` | Password: `Media@123456`

### Voters (3 accounts)
- Email: `voter@example.com` | Password: `Voter@123456`
- Email: `james.smith@example.com` | Password: `Voter@123456`
- Email: `lisa.anderson@example.com` | Password: `Voter@123456`

---

## Testing Instructions

1. Go to `/login` and select any demo account
2. You'll be automatically redirected to the appropriate role dashboard
3. From there you can navigate to any accessible pages for that role
4. Public pages (events, leaderboards, etc.) are accessible without login
5. Role-specific pages require login with the appropriate role

## Quick Navigation Shortcuts

**After Admin Login:**
- `/admin/dashboard` - Overview
- `/admin/events` - Manage events
- `/admin/contestants` - Manage contestants
- `/admin/users` - Manage users

**After Contestant Login:**
- `/events/contestant/dashboard` - Dashboard
- `/events/contestant/analytics` - Your stats
- `/events/contestant/ranking` - Standings

**After Media Login:**
- `/media/dashboard` - Dashboard
- `/media/analytics` - Analytics
- `/media/leaderboard` - Leaderboards

**After Voter Login:**
- `/voter/dashboard` - Dashboard
- `/voter/my-votes` - Your votes
- `/events` - Browse events to vote

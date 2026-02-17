# All Page URLs - v0 Preview Reference

## Public Pages
- `/` - Home page
- `/events` - All events listing
- `/events/archive` - Archived events
- `/how-it-works` - Instructions and guidelines
- `/terms` - Terms of service
- `/privacy` - Privacy policy
- `/refund-policy` - Refund policy
- `/transparency` - Transparency page

## Authentication Pages
- `/login` - User login
- `/verify-phone` - Phone verification (OTP)
- `/verify` - General verification
- `/verify/[receiptNumber]` - Verify specific receipt
- `/session-expired` - Session expired error page
- `/access-denied` - Access denied error page
- `/account-locked` - Account locked error page

## Event Pages
- `/events/[eventSlug]` - Event details
- `/events/[eventSlug]/leaderboard` - Event leaderboard
- `/events/[eventSlug]/results` - Event results
- `/events/[eventSlug]/categories` - Event categories
- `/events/[eventSlug]/contestant/[contestantSlug]` - Contestant profile
- `/events/[eventSlug]/contestant/[contestantSlug]/vote` - Vote for contestant
- `/event/[slug]` - Alternative event route
- `/event/[slug]/contestant/[contestantSlug]` - Alternative contestant route
- `/event/[slug]/contestant/[contestantSlug]/vote` - Alternative vote route
- `/category/[categoryId]` - Category specific page
- `/leaderboard/[eventId]` - Event leaderboard alternative
- `/results/[eventId]` - Event results alternative

## Voting & Checkout Pages
- `/vote/checkout` - Checkout page
- `/receipt/[receiptNumber]` - Receipt page

## User Pages
- `/profile` - User profile
- `/profile/page` - Profile main page
- `/profile/edit` - Edit profile
- `/profile/settings` - Profile settings
- `/profile/security` - Security settings
- `/notifications` - Notifications center

## Voter Pages
- `/voter/dashboard` - Voter dashboard
- `/voter/my-votes` - My votes history
- `/voter/payments` - Payment history
- `/voter/settings` - Voter settings

## Contestant Pages
- `/events/contestant/dashboard` - Contestant dashboard
- `/events/contestant/event` - Contestant event info
- `/events/contestant/ranking` - Contestant rankings
- `/events/contestant/analytics` - Contestant analytics
- `/events/contestant/geographic` - Geographic distribution
- `/events/contestant/revenue` - Revenue analytics
- `/events/contestant/notifications` - Notifications
- `/events/contestant/security` - Security settings
- `/events/contestant/sponsors` - Sponsor management

## Media & Analytics Pages
- `/media` - Media dashboard
- `/media/dashboard` - Media analytics dashboard
- `/media/leaderboard` - Media leaderboard
- `/media/blockchain` - Blockchain verification
- `/media/fraud` - Fraud detection
- `/media/geographic` - Geographic analytics
- `/media/exports` - Data exports
- `/media/analytics` - Detailed analytics
- `/media/notifications` - Notifications

## Admin Pages
- `/admin` - Admin dashboard
- `/admin/dashboard` - Admin main dashboard
- `/admin/dashboard-enhanced` - Enhanced admin dashboard
- `/admin/users` - User management
- `/admin/contestants` - Contestant management
- `/admin/events` - Event management
- `/admin/categories` - Category management
- `/admin/votes` - Vote management
- `/admin/payments` - Payment management
- `/admin/fraud` - Fraud management
- `/admin/moderation` - Content moderation
- `/admin/analytics` - Platform analytics
- `/admin/reports` - Report generation
- `/admin/audit-logs` - Audit logs
- `/admin/announcements` - Announcements
- `/admin/notifications` - Notification management
- `/admin/feature-flags` - Feature flags
- `/admin/health` - Health check
- `/admin/health-check` - Detailed health check
- `/admin/blockchain` - Blockchain management
- `/admin/cache` - Cache management
- `/admin/emergency-controls` - Emergency controls
- `/admin/jobs` - Job queue management
- `/admin/settings` - Admin settings

## Anti-Fraud Pages
- `/anti-fraud` - Anti-fraud dashboard
- `/maintenance` - Maintenance mode

## Suggested Testing Order
1. Start with public pages: `/`, `/events`, `/how-it-works`
2. Test authentication: `/login`, `/verify-phone`
3. Test event pages: `/events/[eventSlug]`, `/events/[eventSlug]/leaderboard`
4. Test user pages: `/profile`, `/voter/dashboard`
5. Test admin pages: `/admin`, `/admin/dashboard`

## New Features - Pages Using Implemented Components

### Leaderboard Interface
- Implementation: `/events/[eventSlug]/leaderboard` (now enhanced with sorting)
- Alternative: `/leaderboard/[eventId]`

### Judge Dashboard
- Expected location: `/events/contestant/dashboard` or new `/admin/judging` page
- Component: `JudgeDashboardInterface`

### SaaS Tenant Config
- Expected location: `/admin/settings` or new `/tenant/config` page
- Component: `SaaSTenantConfig`

### Notification Center
- Location: `/notifications`
- Component: `NotificationCenter`

### Empty States
- Used throughout all pages when data is empty
- Component: `EmptyState`

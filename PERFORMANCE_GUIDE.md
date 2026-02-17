# Performance & Features Guide

## 1. Login Credentials for Testing

All roles use the same password format: `{Role}@123456`

### Admin Role
- **Email**: `admin@votingplatform.com`
- **Password**: `Admin@123456`
- **Features**: Event management, user management, fraud detection
- **Dashboards**: `/admin/dashboard`

### Contestant Role (3 accounts)
- **Account 1**:
  - Email: `contestant@example.com`
  - Password: `Contestant@123456`
  - Event: event-001, Location: Los Angeles, USA

- **Account 2**:
  - Email: `maria.garcia@example.com`
  - Password: `Contestant@123456`
  - Event: event-001, Location: Madrid, Spain

- **Account 3**:
  - Email: `alex.chen@example.com`
  - Password: `Contestant@123456`
  - Event: event-002, Location: Shanghai, China

- **Features**: View votes, analytics, rankings, profile management
- **Dashboard**: `/events/contestant/dashboard`

### Media Role (2 accounts)
- **Account 1**:
  - Email: `media@example.com`
  - Password: `Media@123456`

- **Account 2**:
  - Email: `press@example.com`
  - Password: `Media@123456`

- **Features**: Real-time broadcasting, vote analytics, live leaderboard
- **Dashboard**: `/media/dashboard`

### Voter Role (3 accounts)
- **Account 1**:
  - Email: `voter@example.com`
  - Password: `Voter@123456`
  - Location: Toronto, Canada

- **Account 2**:
  - Email: `james.smith@example.com`
  - Password: `Voter@123456`
  - Location: Sydney, Australia

- **Account 3**:
  - Email: `lisa.anderson@example.com`
  - Password: `Voter@123456`
  - Location: Berlin, Germany

- **Features**: Vote for contestants, manage votes, blockchain verification
- **Dashboard**: `/voter/dashboard`

## 2. Performance Optimizations Applied

### AuthContext Optimization
- ✅ Async session checking on mount (non-blocking)
- ✅ Efficient localStorage usage with cookie fallback
- ✅ Removed nested AuthProvider that caused double renders

### Image Optimization
- ✅ Added `sizes` prop for responsive images
- ✅ Added `priority` prop for above-the-fold images
- ✅ Fixed image dimensions with `w-full h-full` for fill images
- ✅ All Unsplash URLs now include width and height parameters

### Direct Route Navigation
- ✅ Login redirects directly to role-specific dashboards (skips home)
- ✅ Eliminates extra redirect that was causing slow load times

## 3. Mock Data Organization

### Events Mock (`/lib/events-mock.ts`)
- 4 events: Miss Africa 2026, Miss Africa 2025, Mr Africa 2026, Talent Africa 2026
- Status: LIVE, ARCHIVED, UPCOMING
- All have proper banner images, descriptions, and voting rules

### Dashboard Mocks
- **Admin**: `/lib/admin-events-mock.ts`, `/lib/admin-overview-mock.ts`
- **Contestant**: `/lib/contestant-profile-mock.ts`
- **Media**: `/lib/media-mock.ts`
- **Voter**: `/lib/voter-dashboard-mock.ts`, `/lib/voter-mock.ts`

### Category & Contestant Data
- `/lib/category-mock.ts` - 8 categories with contestants and voting stats
- `/lib/leaderboard-mock.ts` - Real-time rankings and analytics
- `/lib/events-mock.ts` - Event details, rules, and organizer info

## 4. Troubleshooting Slow Pages

If pages are still slow:
1. Clear browser cache and localStorage
2. Check Network tab in DevTools for large assets
3. Verify Unsplash images are loading (sometimes delayed by CDN)
4. Check Console for any blocking scripts

## 5. Testing Each Role

### Contestant Dashboard
- Login with contestant credentials
- Should see: Votes received, rankings, analytics, personal stats
- URL: `/events/contestant/dashboard`

### Media Dashboard  
- Login with media credentials
- Should see: Live leaderboard, vote analytics, revenue tracking
- URL: `/media/dashboard`

### Voter Dashboard
- Login with voter credentials
- Should see: Wallet, categories, voting buttons, activity
- URL: `/voter/dashboard`

### Admin Dashboard
- Login with admin credentials
- Should see: Event management, user analytics, fraud detection
- URL: `/admin/dashboard`

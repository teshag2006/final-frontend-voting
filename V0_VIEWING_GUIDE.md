# V0 Viewing Guide - Complete Page URLs

## Quick Navigation

To view any page in v0 Preview, click the URL field and paste the full path. All pages below are available for preview and testing.

---

## Homepage & Public Pages

### Main Pages
```
/                           Home page
/events                     All events listing
/events/archive             Archived events
```

### Information Pages
```
/how-it-works              How voting works
/terms                     Terms of service
/privacy                   Privacy policy
/refund-policy            Refund policy
/transparency             Transparency report
```

---

## Authentication Pages

```
/login                     User login page
/verify-phone             Phone verification with OTP
/verify                   General verification page
/session-expired          Session expired error
/access-denied            Access denied error
/account-locked           Account locked error
/maintenance              Maintenance mode page
```

**Test the Enhanced OTP Page:**
- Path: `/verify-phone`
- Features: Countdown timer, shake animation, success messages

---

## Event Pages

### Event Browsing
```
/events/[eventSlug]                          Event details
/events/[eventSlug]/leaderboard              ⭐ NEW - Leaderboard with sorting
/events/[eventSlug]/results                  Event final results
/events/[eventSlug]/categories               Event categories
```

### Contestant Pages
```
/events/[eventSlug]/contestant/[slug]        Contestant profile
/events/[eventSlug]/contestant/[slug]/vote   Vote for contestant
```

### Alternative Routes (Same Content)
```
/event/[slug]                                Event details (alt)
/event/[slug]/contestant/[slug]              Contestant profile (alt)
/event/[slug]/contestant/[slug]/vote         Vote for contestant (alt)
```

**Replace `[eventSlug]` with actual event slug (e.g., "miss-africa-2024")**

---

## User Profile Pages

### Main Profile
```
/profile                   User profile overview
/profile/edit             ⭐ NEW - Edit profile information
/profile/settings         ⭐ NEW - User settings (preferences, notifications)
/profile/security         ⭐ NEW - Security settings (password, 2FA)
/notifications            ⭐ NEW - Notification center
```

---

## Voter Pages

### Voter Dashboard & History
```
/voter/dashboard          Voter main dashboard
/voter/my-votes          Vote history with filtering
/voter/payments          Payment history
/voter/settings          Voter-specific settings
```

### Voting Process
```
/vote/checkout           Checkout page
/receipt/[number]        Receipt view (replace [number] with receipt ID)
/verify/[number]         Receipt verification
```

---

## Contestant Pages

### Contestant Dashboard
```
/events/contestant/dashboard      ⭐ NEW - Judge scoring interface
/events/contestant/event         Event information for contestants
/events/contestant/ranking       Contestant rankings
/events/contestant/analytics     Contestant analytics
/events/contestant/geographic    Geographic vote distribution
/events/contestant/revenue       Revenue analytics
/events/contestant/notifications Notifications
/events/contestant/security      Security settings
/events/contestant/sponsors      Sponsor management
```

---

## Media Pages

### Media Dashboard
```
/media                           Media main page
/media/dashboard                Media analytics dashboard
/media/leaderboard              Media-specific leaderboard
/media/blockchain               Blockchain verification
/media/fraud                    Fraud detection dashboard
/media/geographic               Geographic analytics
/media/exports                  Data export options
/media/analytics                Detailed analytics
/media/notifications            Notifications
```

---

## Admin Pages

### Main Admin Area
```
/admin                          Admin home
/admin/dashboard               ⭐ ENHANCED - Main admin dashboard
/admin/dashboard-enhanced      Detailed admin dashboard
```

### Management Pages
```
/admin/users                    User management
/admin/contestants              Contestant management
/admin/events                   Event management
/admin/categories               Category management
/admin/votes                    Vote management
/admin/payments                 Payment management
```

### Monitoring & Moderation
```
/admin/fraud                    Fraud case management
/admin/moderation               Content moderation
/admin/audit-logs               Audit logs
/admin/announcements            Announcements
/admin/notifications            Notification system
/admin/reports                  Report generation
```

### System Administration
```
/admin/settings                 ⭐ NEW - Tenant configuration (branding, pricing, scoring)
/admin/feature-flags            Feature flags
/admin/health                   Health status
/admin/health-check             Detailed health check
/admin/blockchain               Blockchain management
/admin/cache                    Cache management
/admin/emergency-controls       Emergency controls
/admin/jobs                     Job queue management
/admin/analytics                Platform analytics
```

### Anti-Fraud
```
/anti-fraud                     Anti-fraud dashboard
```

---

## Testing Order (Recommended)

### 1. Public Exploration (5 minutes)
- [ ] `/` - Home page
- [ ] `/events` - Events list
- [ ] `/how-it-works` - Instructions

### 2. Authentication (10 minutes)
- [ ] `/login` - Login form
- [ ] `/verify-phone` - OTP verification (NEW - with countdown timer)

### 3. Event Pages (15 minutes)
- [ ] `/events/[eventSlug]` - Event details
- [ ] `/events/[eventSlug]/leaderboard` - **LEADERBOARD (NEW - sortable)**
- [ ] `/events/[eventSlug]/results` - Results

### 4. User Pages (15 minutes)
- [ ] `/profile` - User profile
- [ ] `/profile/settings` - **SETTINGS (NEW)**
- [ ] `/notifications` - **NOTIFICATION CENTER (NEW)**
- [ ] `/voter/dashboard` - Voter dashboard

### 5. Voting Pages (10 minutes)
- [ ] `/voter/my-votes` - Vote history
- [ ] `/voter/payments` - Payment history

### 6. Contestant Pages (10 minutes)
- [ ] `/events/contestant/dashboard` - **JUDGE DASHBOARD (NEW - scoring)**
- [ ] `/events/contestant/ranking` - Rankings
- [ ] `/events/contestant/analytics` - Analytics

### 7. Admin Pages (20 minutes)
- [ ] `/admin` - Admin home
- [ ] `/admin/dashboard` - **ENHANCED dashboard**
- [ ] `/admin/settings` - **TENANT CONFIG (NEW - branding & pricing)**
- [ ] `/admin/fraud` - Fraud management
- [ ] `/admin/analytics` - Analytics
- [ ] `/admin/users` - User management

### 8. Special Features (10 minutes)
- [ ] `/verify-phone` - OTP with countdown timer animation
- [ ] `/events/[eventSlug]/leaderboard` - Sortable table with filtering
- [ ] `/events/contestant/dashboard` - Judge scoring interface

---

## Component Feature Highlights

### Leaderboard Interface (`/events/[eventSlug]/leaderboard`)
- Sort by rank or votes (ascending/descending)
- Category filtering
- Rank change indicators (up/down arrows)
- Top 3 special styling (gold/silver/bronze)
- Refresh button with loading animation

### Judge Dashboard (`/events/contestant/dashboard`)
- Score input with range sliders
- Weighted calculation display (30-40-30% weights)
- Preview mode before submission
- Score locking for safety
- Batch scoring for multiple contestants

### SaaS Tenant Config (`/admin/settings`)
- Brand customization (name, logo, colors)
- Custom domain configuration
- Pricing tier management
- Scoring algorithm weights
- Live color preview

### Notification Center (`/notifications`)
- Unread notification counter
- Filter by read/unread
- Notification type styling (info/success/warning/error)
- Mark as read, archive, delete
- Time-formatted display (just now, 2h ago)

### Enhanced OTP (`/verify-phone`)
- 60-second countdown timer for resend
- Shake animation on error
- Success message notifications
- Auto-dismissing messages

---

## Features by Page

### New Major Features
| Page | Feature | Status |
|------|---------|--------|
| `/events/[eventSlug]/leaderboard` | Sortable leaderboard | ✓ Complete |
| `/events/contestant/dashboard` | Judge scoring dashboard | ✓ Complete |
| `/admin/settings` | Tenant configuration UI | ✓ Complete |
| `/notifications` | Notification center | ✓ Complete |
| `/profile/settings` | User settings page | ✓ Complete |
| `/profile/edit` | Profile editing | ✓ Complete |
| `/profile/security` | Security settings | ✓ Complete |
| `/verify-phone` | Enhanced OTP verification | ✓ Complete |

### Global Features Added
| Feature | Implementation |
|---------|-----------------|
| Empty states | All list views |
| Skeleton loaders | All data-loading pages |
| Animations | Page transitions, list items |
| Accessibility | WCAG 2.1 AA compliance |
| Mobile optimization | All components |
| Dark mode ready | CSS variables set up |

---

## Browser DevTools Tips

### Check Console for Errors
- Open DevTools (F12)
- Go to Console tab
- Look for any red error messages
- Report any issues found

### Test Accessibility
- Go to DevTools → Lighthouse
- Select "Accessibility" audit
- Run the audit
- Review any accessibility issues

### Performance Testing
- Go to DevTools → Performance
- Record a page interaction
- Look for janky animations or slow loads
- Check the "Frames" panel

### Mobile Testing
- DevTools → Toggle device toolbar (Ctrl+Shift+M)
- Select various device sizes
- Test touch interactions
- Check responsive layouts

---

## Notes

- Replace `[eventSlug]` with actual event slugs from your database
- Replace `[contestantSlug]` with actual contestant slugs
- Replace `[receiptNumber]` with actual receipt numbers
- Admin pages require authentication
- Some features may be placeholder data until backend is integrated

---

## Support

If you encounter any issues:
1. Check the browser console (F12) for errors
2. Verify the page path is correct
3. Ensure you're authenticated (if required)
4. Check `FRONTEND_FEATURES_IMPLEMENTATION_GUIDE.md` for component usage
5. Review `ERROR_REPORT_AND_FIXES.md` for known issues

---

**Happy testing! All features are ready for preview in v0.**

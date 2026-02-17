# Implementation Priority Guide

## Quick Summary
- **1 Critical Error**: Fixed (React hook misuse in verify-phone)
- **Missing Features**: 17 major features identified
- **Current Completion**: 60% frontend, 40% missing features
- **Recommendation**: Implement in 4 phases over 8-10 days

---

## Phase 1: High-Impact Core Features (2-3 Days)

### 1.1 Leaderboard Interface
**File**: `/app/events/[eventSlug]/leaderboard/page.tsx`

**Components to Create**:
- `LeaderboardTable` - Sortable table with columns: Rank, Name, Votes, Category
- `RankIndicator` - Shows up/down arrows with percentage change
- `LeaderboardFilters` - Category, time period filters
- `LeaderboardActions` - Refresh button, sort controls

**Features**:
- Sort by rank, votes, votes-today, votes-this-week
- Click column headers to sort
- Top 3 highlighted with badges
- Live status badge (updated X minutes ago)
- Responsive table on mobile
- Performance: Virtual scroll for 1000+ rows

**Estimated Time**: 6 hours

---

### 1.2 Judge Dashboard
**File**: `/app/events/contestant/dashboard/page.tsx` (enhance existing)

**Components to Create**:
- `JudgeScorePanel` - Score input with +/- spinners
- `CategoryScoring` - Show weights, calculate totals
- `ScorePreviewModal` - Review before submission
- `ScoringHistory` - Timeline of past scores
- `JudgeInstructions` - Modal with guidelines

**Features**:
- Numeric input with validation (0-100)
- Category weights auto-calculate (e.g., performance 40%, creativity 30%)
- Lock submission with warning
- Save as draft
- Submit with confirmation
- View scoring history

**Estimated Time**: 5 hours

---

### 1.3 User Settings Pages
**Files**: 
- `/app/profile/page.tsx` (enhance)
- `/app/profile/security/page.tsx`
- `/app/profile/settings/page.tsx`

**Components to Create**:
- `ProfileForm` - Name, email, phone, avatar upload
- `SecuritySettings` - 2FA setup, sessions, password change
- `NotificationPreferences` - Checkboxes for notification types
- `PaymentHistory` - Table of transactions
- `VoteHistory` - Filter by event, date, amount
- `AccountDeletion` - Confirmation modal with recovery option

**Features**:
- Form validation with error messages
- Avatar image upload preview
- Password strength indicator
- 2FA toggle with setup wizard
- Active sessions management
- Transaction pagination
- Advanced filtering for history

**Estimated Time**: 8 hours

---

## Phase 2: Accessibility & Foundation (2 Days)

### 2.1 Keyboard Navigation
**Applies To**: All components built so far

**Required**:
- Tab through interactive elements in logical order
- Enter to activate buttons/links
- Escape to close modals/dropdowns
- Arrow keys in lists/dropdowns
- Space for toggles/checkboxes
- Shift+Tab for reverse navigation

**Implementation Pattern**:
```tsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
    if (e.key === 'Escape') closeModal();
  }}
  tabIndex={0}
>
  Click me
</button>
```

**Estimated Time**: 6 hours

---

### 2.2 ARIA Labels & Screen Readers
**Applies To**: All interactive elements

**Required**:
```tsx
<button aria-label="Close modal">✕</button>
<div role="navigation" aria-label="Main navigation">
<input aria-describedby="password-requirements" />
<span id="password-requirements">Min 8 chars, 1 number</span>
```

**Estimated Time**: 4 hours

---

### 2.3 Empty State Screens
**Files to Create**:
- `/components/features/empty-states.tsx`

**Components**:
- Empty search results
- Empty notifications
- Empty vote history
- Empty payment history
- Empty favorites

**Pattern**:
- Icon + heading + description + CTA button
- Consistent styling across all
- Helpful suggestions

**Estimated Time**: 3 hours

---

## Phase 3: SaaS Features (2-3 Days)

### 3.1 Branding Configuration Panel
**File**: `/app/admin/settings/page.tsx` (enhance)

**Components to Create**:
- `BrandingPanel` - Logo, colors, fonts
- `ColorPicker` - Interactive color selection
- `PreviewPane` - Live preview of changes
- `FontSelector` - Google Fonts dropdown

**Features**:
- Logo upload with preview
- Color picker for primary, secondary, accent
- Font selection (title & body)
- Reset to default button
- Save changes with confirmation

**Estimated Time**: 5 hours

---

### 3.2 Event Configuration Wizard
**File**: `/app/admin/events/page.tsx` (enhance)

**Components to Create**:
- `EventWizard` - Multi-step form
- `BasicInfo` - Event name, dates, description
- `Categories` - Add/remove categories
- `Judges` - Add judge emails
- `Scoring` - Configure weights
- `ReviewPublish` - Final review & publish

**Estimated Time**: 6 hours

---

### 3.3 Pricing Management
**File**: `/app/admin/settings/page.tsx` (new section)

**Components to Create**:
- `PricingTierEditor` - Create/edit pricing tiers
- `BundleManager` - Configure vote bundles
- `DiscountRules` - Bulk/seasonal discounts
- `PreviewPricing` - Show to users

**Estimated Time**: 4 hours

---

## Phase 4: Polish & Performance (2 Days)

### 4.1 Real-Time Notifications
**File**: `/components/features/notification-system.tsx`

**Components to Create**:
- Enhanced `NotificationCenter` - Pagination, search
- `ToastNotifications` - Success, error, info types
- `PushNotificationPrompt` - Browser permission request
- `NotificationBell` - Animated badge with count

**Estimated Time**: 4 hours

---

### 4.2 Analytics & Charts
**File**: `/app/admin/analytics/page.tsx` (enhance)

**Components**:
- Vote trend line chart
- Category distribution pie chart
- Geographic heatmap
- User engagement metrics
- Revenue analytics

**Library**: Recharts (already installed)

**Estimated Time**: 4 hours

---

### 4.3 Animations & Transitions
**Apply To**: All pages

**Animations**:
- Page fade-in on load
- List item slide-in
- Modal fade-in with scale
- Toast slide-up
- Loading skeleton pulse
- Countdown timer pulse

**Estimated Time**: 3 hours

---

## Implementation Checklist

### Before Starting
- [ ] Read MISSING_FEATURES_ANALYSIS.md
- [ ] Read ERROR_REPORT_AND_FIXES.md
- [ ] Review existing component patterns
- [ ] Verify all dependencies installed

### During Implementation
- [ ] Use TypeScript strict mode
- [ ] Add proper error handling
- [ ] Test keyboard navigation
- [ ] Check WCAG contrast ratios
- [ ] Test on mobile devices
- [ ] Add loading states
- [ ] Document props & usage

### Before Commit
- [ ] Remove console.log statements
- [ ] Run TypeScript check: `tsc --noEmit`
- [ ] Test in different browsers
- [ ] Verify responsive on mobile
- [ ] Update documentation

---

## Component Structure Pattern

All new components should follow this pattern:

```tsx
'use client'; // if interactive

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction?: (value: string) => void;
}

export function ComponentName({ prop1, prop2, onAction }: ComponentProps) {
  const [state, setState] = useState('');

  const handleAction = useCallback(() => {
    onAction?.(state);
  }, [state, onAction]);

  return (
    <div className="space-y-4">
      {/* Content */}
      <Button onClick={handleAction}>
        Action
      </Button>
    </div>
  );
}
```

---

## Styling Guidelines

All components should use:
- Tailwind CSS classes
- Design tokens from globals.css
- Semantic HTML elements
- Proper spacing (gap, p, m utilities)
- Responsive design (md:, lg: prefixes)
- Color tokens (bg-background, text-foreground)

**Don't Use**:
- Arbitrary values [123px]
- Inline styles
- CSS modules
- Multiple class libraries

---

## Testing Requirements

Each feature needs:

1. **Component Tests** - Rendering, prop variations
2. **Interaction Tests** - Button clicks, form submission
3. **Accessibility Tests** - ARIA labels, keyboard nav
4. **Visual Tests** - Different screen sizes, themes
5. **Performance Tests** - Virtual scroll, large lists

---

## Deployment Considerations

Before deploying:
- [ ] All TypeScript checks pass
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Mobile responsive
- [ ] Accessibility score > 95
- [ ] No memory leaks in timers
- [ ] Error boundaries in place

---

## Risk Mitigation

**Risk**: Large feature takes longer than estimated
**Mitigation**: Break into smaller subtasks, implement MVP first

**Risk**: Accessibility issues in production
**Mitigation**: Test with keyboard & screen reader before each commit

**Risk**: Performance degradation with new features
**Mitigation**: Monitor bundle size, use virtual scrolling for lists

**Risk**: Browser compatibility issues
**Mitigation**: Test on Chrome, Firefox, Safari, Edge


# Frontend Components Integration Guide

## Quick Start - Use These New Components

This guide shows how to integrate the newly created frontend components into your pages and applications.

---

## 1. CONTESTANT DISCOVERY

### ContestantSearch - Server-Side Search

**Location:** `/components/public/contestant-search.tsx`

**Usage:**
```tsx
import { ContestantSearch } from '@/components/public/contestant-search';

export function CategoryPage() {
  return (
    <div className="space-y-4">
      <ContestantSearch 
        categoryId="tech" 
        placeholder="Find contestants..."
        onSearch={(query) => console.log('Searching:', query)}
      />
    </div>
  );
}
```

**Features:**
- 400ms debounce on search input
- Requires minimum 2 characters
- Recent search history (localStorage)
- Search results dropdown with contestant preview
- API Integration ready: `GET /api/contestants/search`

**Props:**
- `categoryId?` - Filter by category
- `onSearch?` - Callback when search executes
- `placeholder?` - Custom placeholder text

---

### AlphabeticalJump - A-Z Navigation

**Location:** `/components/public/alphabetical-jump.tsx`

**Usage:**
```tsx
import { AlphabeticalJump } from '@/components/public/alphabetical-jump';

export function ContestantBrowser() {
  const handleLetterSelect = (letter: string) => {
    console.log('Jump to:', letter);
    // Scroll to first contestant with this letter
    // or filter API results by letter
  };

  return (
    <AlphabeticalJump 
      onLetterSelect={handleLetterSelect}
      selectedLetter="A"
    />
  );
}
```

**Features:**
- Smooth scroll to letter
- Active letter highlighting
- Clear filter button
- Responsive horizontal scroll
- Full keyboard accessible

**Props:**
- `onLetterSelect` - Callback with selected letter
- `selectedLetter?` - Currently selected letter
- `className?` - Additional CSS classes

---

### SearchFilters - Multi-Select Filtering

**Location:** `/components/public/search-filters.tsx`

**Usage:**
```tsx
import { SearchFilters, FilterGroup } from '@/components/public/search-filters';

export function ContestantFilters() {
  const filterGroups: FilterGroup[] = [
    {
      id: 'region',
      title: 'Region',
      options: [
        { id: 'north', label: 'North', count: 245 },
        { id: 'south', label: 'South', count: 189 },
      ],
    },
    {
      id: 'category',
      title: 'Category',
      expandable: true,
      options: [
        { id: 'tech', label: 'Technology' },
        { id: 'business', label: 'Business' },
      ],
    },
  ];

  const [selectedFilters, setSelectedFilters] = useState({});

  return (
    <SearchFilters
      groups={filterGroups}
      selectedFilters={selectedFilters}
      onFiltersChange={setSelectedFilters}
      onClearAll={() => setSelectedFilters({})}
    />
  );
}
```

**Features:**
- Multi-select checkboxes
- Expandable/collapsible groups
- Applied filter badges
- Active filter count
- Clear all functionality
- Counter display per option

**Props:**
- `groups` - Filter group configuration
- `selectedFilters` - Selected filter state
- `onFiltersChange` - Update handler
- `onClearAll?` - Clear all callback

---

## 2. VOTING INTERFACE

### VoteEligibilityCheck - Validation Display

**Location:** `/components/vote-selection/vote-eligibility-check.tsx`

**Usage:**
```tsx
import { VoteEligibilityCheck, EligibilityStatus } from '@/components/vote-selection/vote-eligibility-check';

export function VoteButton() {
  const eligibilityStatus: EligibilityStatus = {
    isEligible: true,
    voteCount: 1,
    votingWindow: {
      isActive: true,
    },
    region: {
      allowed: true,
    },
    accountAge: {
      met: true,
    },
    deviceVerification: {
      verified: true,
      status: 'verified',
    },
  };

  if (!eligibilityStatus.isEligible) {
    return <VoteEligibilityCheck status={eligibilityStatus} />;
  }

  return <button>Vote Now</button>;
}
```

**Features:**
- Voting window validation
- Region restriction checking
- Account age requirements
- Device verification status
- Severity-based alerts
- Custom message support

**Props:**
- `status` - Eligibility status object
- `className?` - Additional CSS

---

### BulkVoteInterface - Shopping Cart

**Location:** `/components/vote-selection/bulk-vote-interface.tsx`

**Usage:**
```tsx
import { BulkVoteInterface } from '@/components/vote-selection/bulk-vote-interface';

export function PaidVotingPage() {
  const packages = [
    { quantity: 1, price: 0.99 },
    { quantity: 5, price: 4.49, discount: 10 },
    { quantity: 10, price: 8.99, discount: 15 },
  ];

  const handleCheckout = (cart) => {
    console.log('Checkout:', cart);
    // Navigate to payment
  };

  return (
    <BulkVoteInterface
      availablePackages={packages}
      onCheckout={handleCheckout}
    />
  );
}
```

**Features:**
- Package selection with pricing
- Shopping cart with quantity controls
- Real-time total calculation
- Discount badge display
- Contestant image preview
- Checkout handler

**Props:**
- `availablePackages` - Vote package options
- `onVotesAdded?` - Cart update callback
- `onCheckout?` - Checkout handler

---

## 3. LEADERBOARD & RANKINGS

### useLeaderboard - Live Polling Hook

**Location:** `/hooks/useLeaderboard.ts`

**Usage:**
```tsx
import { useLeaderboard } from '@/hooks/useLeaderboard';

export function LiveLeaderboard() {
  const {
    leaderboard,
    isLoading,
    isError,
    lastUpdated,
    refresh,
    getRankChange,
  } = useLeaderboard({
    eventId: 'event123',
    categoryId: 'tech',
    pollingIntervalMs: 25000, // 25 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading leaderboard</div>;

  return (
    <div>
      <button onClick={refresh}>Refresh Now</button>
      <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      
      {leaderboard.map((entry) => {
        const rankChange = getRankChange(entry.contestantId);
        return (
          <div key={entry.contestantId}>
            <span>#{entry.rank}</span>
            <span>{entry.name}</span>
            <span>{entry.voteCount}</span>
            <span>{rankChange.direction}</span>
          </div>
        );
      })}
    </div>
  );
}
```

**Features:**
- SWR-based automatic polling
- Configurable poll interval (15-30s recommended)
- Rank change detection
- Stale-while-revalidate caching
- Manual refresh capability
- Exponential backoff on errors

**Options:**
- `eventId?` - Filter by event
- `categoryId?` - Filter by category
- `limit?` - Max entries (default: 100)
- `pollingIntervalMs?` - Poll interval (default: 20000)
- `enabled?` - Enable/disable polling
- `onError?` - Error callback

---

### RankChangeIndicator - Rank Display

**Location:** `/components/leaderboard/rank-change-indicator.tsx`

**Usage:**
```tsx
import { RankChangeIndicator, CompactRankChange } from '@/components/leaderboard/rank-change-indicator';

// Full version
<RankChangeIndicator
  currentRank={5}
  previousRank={8}
  voteCount={1250}
  leaderVoteCount={5000}
  showPercentageToLeader={true}
  animate={true}
/>

// Compact version for tables
<CompactRankChange
  currentRank={5}
  previousRank={8}
/>
```

**Features:**
- Up/down trend visualization
- Animated rank changes
- Percentage to leader progress bar
- Vote count display
- Two size variants
- Accessibility support

**Props:**
- `currentRank` - Current rank position
- `previousRank?` - Previous rank for change detection
- `voteCount` - Total votes
- `leaderVoteCount?` - Leader vote count
- `showPercentageToLeader?` - Show progress bar
- `animate?` - Enable animations

---

## 4. ANIMATIONS

### VoteCounterAnimation - Live Counter

**Location:** `/components/animations/vote-counter-animation.tsx`

**Usage:**
```tsx
import { 
  VoteCounterAnimation, 
  HeroVoteCounter, 
  CompactVoteCounter 
} from '@/components/animations/vote-counter-animation';

// Custom animation
<VoteCounterAnimation
  count={15250}
  previousCount={15000}
  duration={500}
  format={(num) => num.toLocaleString()}
/>

// Hero version (large display)
<HeroVoteCounter
  count={1_250_000}
  previousCount={1_240_000}
  label="Total Votes"
/>

// Compact inline version
<CompactVoteCounter
  count={150}
  previousCount={140}
/>
```

**Features:**
- Smooth count transitions
- Flash effects on update
- Floating change indicators
- Multiple size variants
- Customizable duration
- Automatic color coding (green/red for changes)

**Props:**
- `count` - Current count
- `previousCount?` - Previous count for animation
- `duration?` - Animation length (ms)
- `format?` - Custom number formatter
- `showAnimation?` - Enable animations

---

## 5. EVENT MANAGEMENT

### EventFilters - Event Search & Filter

**Location:** `/components/events/event-filters.tsx`

**Usage:**
```tsx
import { EventFilters, EventFiltersState } from '@/components/events/event-filters';

export function EventsPage() {
  const categories = [
    { id: 'pageant', name: 'Pageants' },
    { id: 'talent', name: 'Talent Shows' },
  ];

  const handleFiltersChange = (filters: EventFiltersState) => {
    console.log('Filters changed:', filters);
    // Fetch events with new filters
  };

  return (
    <EventFilters
      categories={categories}
      onFiltersChange={handleFiltersChange}
    />
  );
}
```

**Features:**
- Event status filtering (live, upcoming, closed, archived)
- Category-based filtering
- Sort options (newest, popular, trending)
- Full-text search
- Active filter badges
- Mobile-responsive UI
- URL-based state persistence

**Filters:**
- `search` - Event name search
- `status` - Event status
- `category` - Event category
- `sort` - Sort order

---

## API Endpoints Expected

These components assume these API endpoints exist:

### 1. Contestant Search
```
GET /api/contestants/search?q={query}&limit={limit}&categoryId={categoryId}

Response:
{
  "results": [
    { "id": "...", "name": "...", "category": "...", "rank": 5 }
  ]
}
```

### 2. Leaderboard
```
GET /api/leaderboard?eventId={id}&categoryId={id}&limit={100}

Response:
{
  "entries": [
    { "rank": 1, "contestantId": "...", "name": "...", "voteCount": 5000 }
  ],
  "totalVotes": 1250000
}
```

---

## Integration Checklist

- [ ] Install new components in your pages
- [ ] Connect to backend API endpoints
- [ ] Test debounced search (400ms)
- [ ] Verify leaderboard polling (15-30s intervals)
- [ ] Test vote eligibility flows
- [ ] Verify bulk vote calculations
- [ ] Test mobile responsiveness
- [ ] Validate keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Performance test (bundle size, animations)

---

## Component Dependencies

All components use:
- **shadcn/ui** - UI components (Button, Input, Card, etc.)
- **next/image** - Image optimization
- **lucide-react** - Icons
- **swr** - Data fetching (useLeaderboard hook)
- **tailwindcss** - Styling

No additional dependencies required beyond what's already in package.json.

---

## Performance Tips

1. **Leaderboard Polling:** Use 25-30 second intervals for live events
2. **Search Debounce:** 300-400ms works well for search
3. **Image Optimization:** Already handled by Next.js Image component
4. **Bundle Size:** Each component ~2-5KB gzipped
5. **Animations:** Disable on mobile for better performance

---

## Accessibility

All components include:
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Color contrast compliance

Test with:
- Keyboard only navigation
- VoiceOver (Mac), NVDA (Windows)
- Axe DevTools
- Chrome DevTools accessibility

---

## Support

For issues or questions:
1. Check the component source code
2. Review the FRONTEND_IMPLEMENTATION_GUIDE.md
3. Check the IMPLEMENTATION_PROGRESS.md for status


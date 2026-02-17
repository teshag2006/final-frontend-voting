# Frontend Integration Quick-Start Guide

## For Backend Teams: Getting Started with Frontend Components

This guide helps backend developers understand and integrate the frontend components into your API and WebSocket infrastructure.

---

## 1. Setup & Installation

### Prerequisites
```bash
node --version  # 18+
npm --version   # 9+
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001/ws
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Run Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 2. Key Components Overview

### Authentication Components
**Location**: `components/auth/`

```tsx
// Sign In
import { SignInForm } from '@/components/auth/signin-form';

<SignInForm 
  onSubmit={async (email, password) => {
    // Call your API: POST /api/auth/signin
  }}
/>

// Sign Up
import { SignUpForm } from '@/components/auth/signup-form';

<SignUpForm 
  onSubmit={async (data) => {
    // Call your API: POST /api/auth/signup
  }}
/>

// Password Reset
import { PasswordResetForm } from '@/components/auth/password-reset-form';

<PasswordResetForm 
  onSubmit={async (email, token, newPassword) => {
    // Call your API: POST /api/auth/reset-password
  }}
/>
```

### Search & Discovery
**Location**: `components/public/`

```tsx
import { ContestantSearch } from '@/components/public/contestant-search';

<ContestantSearch 
  onSearch={(query) => {
    // Call: GET /api/contestants/search?q={query}
  }}
/>
```

### Admin Dashboard
**Location**: `components/admin/`

```tsx
import { DashboardOverview } from '@/components/admin/dashboard-overview';
import { EventManagementAdmin } from '@/components/admin/event-management-admin';
import { ContestantManagementAdmin } from '@/components/admin/contestant-management-admin';
import { FraudDetectionDashboard } from '@/components/admin/fraud-detection-dashboard';

<DashboardOverview 
  kpiData={/* from GET /api/admin/dashboard */}
  chartData={/* historical metrics */}
  onTimeframeChange={(tf) => {/* fetch new data */}}
/>
```

---

## 3. API Requirements

### Required Endpoints

#### Authentication
```
POST /api/auth/signin
  Body: { email: string, password: string }
  Response: { token: string, user: User }

POST /api/auth/signup
  Body: { firstName, lastName, email, password }
  Response: { token: string, user: User }

POST /api/auth/forgot-password
  Body: { email: string }
  Response: { message: string }

POST /api/auth/reset-password
  Body: { email, token, newPassword }
  Response: { message: string }
```

#### Search
```
GET /api/contestants/search?q={query}&categoryId={id}&limit=10
  Response: { results: Contestant[], total: number }

GET /api/leaderboard?limit=100&eventId={id}&categoryId={id}
  Response: { entries: LeaderboardEntry[], totalVotes: number, lastUpdated: ISO8601 }
```

#### Admin
```
GET /api/admin/dashboard?timeframe=24h|7d|30d
  Response: { 
    stats: { totalVotes, totalUsers, totalRevenue, fraudCases },
    charts: ChartData[]
  }

GET /api/admin/events
  Response: { events: Event[], total: number }

POST /api/admin/events
  Body: Event
  Response: { id: string, ...Event }

GET /api/admin/contestants
  Response: { contestants: Contestant[], total: number }

GET /api/admin/fraud-cases
  Response: { cases: FraudCase[], patterns: FraudPattern[] }
```

#### Profiles
```
GET /api/profiles/:id
  Response: { user: User, profile: Profile }

GET /api/profiles/:id/voting-history
  Response: { votes: Vote[] }

GET /api/profiles/:id/photos
  Response: { photos: Photo[] }
```

---

## 4. WebSocket Integration

### WebSocket Server Setup

The frontend expects a WebSocket server at `ws://localhost:3001/ws`

### Message Types

```typescript
// Incoming from server
interface WebSocketMessage {
  type: 'vote' | 'leaderboard-update' | 'live-alert' | 'notification' | 'error';
  data: any;
  timestamp: ISO8601;
}

// Vote notification
{
  type: 'vote',
  data: {
    contestantId: string,
    voteCount: number,
    rank: number,
    eventId: string
  }
}

// Leaderboard update
{
  type: 'leaderboard-update',
  data: {
    entries: LeaderboardEntry[],
    eventId: string,
    categoryId: string
  }
}

// Live alert (fraud, high activity, etc)
{
  type: 'live-alert',
  data: {
    severity: 'low' | 'medium' | 'high',
    message: string,
    actionRequired: boolean
  }
}

// In-app notification
{
  type: 'notification',
  data: {
    title: string,
    message: string,
    action?: { label: string, url: string }
  }
}
```

### Using WebSocket Hook

```tsx
import { useWebSocket, useLiveVotes, useLiveAlerts } from '@/hooks/useWebSocket';

export function LiveUpdates() {
  // Get all live votes
  const votes = useLiveVotes(eventId);
  
  // Get all alerts
  const alerts = useLiveAlerts();
  
  // Manual subscription
  const { subscribe, send } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL,
    autoConnect: true
  });
  
  useEffect(() => {
    const unsubscribe = subscribe('vote', (message) => {
      console.log('New vote:', message.data);
    });
    
    return unsubscribe;
  }, [subscribe]);
  
  return (
    <div>
      {votes.map(vote => (
        <p>{vote.contestantId}: {vote.voteCount} votes</p>
      ))}
    </div>
  );
}
```

---

## 5. Notifications System

### Setup in Layout

```tsx
// app/layout.tsx
import { NotificationProvider } from '@/components/notifications/notification-context';
import { NotificationContainer } from '@/components/notifications/notification-container';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          {children}
          <NotificationContainer />
        </NotificationProvider>
      </body>
    </html>
  );
}
```

### Usage in Components

```tsx
import { useNotifications } from '@/components/notifications/notification-context';

export function MyComponent() {
  const { addNotification } = useNotifications();
  
  const handleVote = async () => {
    try {
      const response = await fetch('/api/votes', { method: 'POST' });
      
      addNotification({
        type: 'success',
        title: 'Vote Submitted',
        message: 'Your vote has been recorded',
        duration: 3000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to submit vote',
        duration: 5000
      });
    }
  };
  
  return <button onClick={handleVote}>Vote</button>;
}
```

---

## 6. Component Props Reference

### DashboardOverview
```tsx
interface DashboardOverviewProps {
  kpiData: {
    totalVotes: number;
    totalUsers: number;
    totalRevenue: number;
    fraudCases: number;
    previousVotes?: number;
    previousUsers?: number;
    previousRevenue?: number;
    previousFraud?: number;
  };
  chartData: Array<{
    timestamp: string;
    votes: number;
    revenue: number;
    users: number;
    fraudAlerts: number;
  }>;
  isLoading?: boolean;
  timeframe?: '24h' | '7d' | '30d';
  onTimeframeChange?: (timeframe) => void;
}
```

### VirtualTable
```tsx
interface VirtualTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowHeight?: number;          // default: 50
  visibleRows?: number;        // default: 10
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  searchableColumns?: (keyof T)[];
}
```

### ContestantSearch
```tsx
interface ContestantSearchProps {
  categoryId?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}
```

---

## 7. Data Types

### Contestant
```typescript
interface Contestant {
  id: string;
  name: string;
  category: string;
  voteCount: number;
  rank: number;
  photoUrl?: string;
  bio?: string;
  eventId: string;
  createdAt: ISO8601;
}
```

### Event
```typescript
interface Event {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'live' | 'ended' | 'archived';
  startDate: ISO8601;
  endDate: ISO8601;
  category: string;
  totalVotes: number;
  totalRevenue: number;
  createdAt: ISO8601;
}
```

### LeaderboardEntry
```typescript
interface LeaderboardEntry {
  rank: number;
  contestantId: string;
  name: string;
  voteCount: number;
  category?: string;
  previousRank?: number;
  percentageToLeader?: number;
}
```

---

## 8. Common Integration Patterns

### Protected Routes
```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  return NextResponse.next();
}
```

### Admin Layout
```tsx
// app/admin/layout.tsx
import { AdminSidebar } from '@/components/admin/sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

### Live Dashboard
```tsx
// app/admin/page.tsx
import { DashboardOverview } from '@/components/admin/dashboard-overview';

export default async function AdminPage() {
  const dashboardData = await fetch(
    `${process.env.API_URL}/admin/dashboard?timeframe=24h`
  ).then(r => r.json());
  
  return (
    <DashboardOverview
      kpiData={dashboardData.stats}
      chartData={dashboardData.charts}
    />
  );
}
```

---

## 9. Testing Components

### Unit Testing
```tsx
import { render, screen } from '@testing-library/react';
import { SignInForm } from '@/components/auth/signin-form';

describe('SignInForm', () => {
  it('submits form data', async () => {
    const onSubmit = jest.fn();
    render(<SignInForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(screen.getByText('Sign In'));
    
    expect(onSubmit).toHaveBeenCalledWith('test@example.com', expect.any(String));
  });
});
```

---

## 10. Performance Optimization

### Code Splitting
```tsx
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src={photoUrl}
  alt="Contestant"
  width={200}
  height={200}
  priority={false}
  placeholder="blur"
/>
```

### Memoization
```tsx
import { useMemo } from 'react';

const filteredVotes = useMemo(() => {
  return votes.filter(v => v.category === selectedCategory);
}, [votes, selectedCategory]);
```

---

## 11. Troubleshooting

### WebSocket Connection Issues
```typescript
// Check connection status
const { isConnected } = useWebSocket({ autoConnect: true });

if (!isConnected) {
  console.log('WebSocket not connected');
  // Retry or show offline message
}
```

### API 404 Errors
- Ensure endpoints match exactly (check trailing slashes, case sensitivity)
- Verify API base URL in environment variables
- Check CORS configuration on backend

### Component TypeScript Errors
- Ensure all required props are provided
- Check data type matches expected interface
- Use `type Check` tool for validation

---

## 12. Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com/ws
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Monitoring
- Monitor WebSocket connection health
- Track API response times
- Log authentication failures
- Monitor bundle size

---

## Support Resources

- **Component Documentation**: See FRONTEND_COMPONENT_GUIDE.md
- **Implementation Status**: See FRONTEND_IMPLEMENTATION_COMPLETE.md
- **Features List**: See FRONTEND_FEATURES_SEPARATED.md
- **API Examples**: Check individual component files for usage examples

---

**Last Updated**: 2024
**Maintenance**: Keep components updated with backend API changes
**Contact**: Development Team

# Sponsor Campaigns Page Mockup Spec

## Goal
Create a **high-fidelity UI mockup** for:

- `http://localhost:3000/sponsors/campaigns?contestant=sarah-m`

This is the Sponsor Portal page where a sponsor creates a campaign request and tracks campaign workflow status.

Use this as a **product-accurate design brief** (not generic UI). The generated design should be visually polished, modern, and production-ready.

## Context
- Product area: Sponsor Portal (authenticated sponsor workspace)
- Parent layout includes:
  - Top sticky header with sponsor branding (navy gradient, crown icon, notifications/avatar area)
  - Left sidebar navigation:
    - Dashboard
    - Discover Contestants
    - Campaigns (active page)
    - Profile Settings
- Main content is the campaign request and tracking interface.

## Core User Scenario
Sponsor arrives from contestant detail page CTA (`Request Sponsorship`) with query param:

- `contestant=sarah-m`

Because of this:
- Contestant dropdown is preselected to Sarah M and locked (readonly behavior).
- Form is intended to create or submit a sponsorship request for admin review.

## Real Data to Reflect in Mockup

### Selected contestant (`sarah-m`)
- Name: `Sarah M`
- Slug: `sarah-m`
- Category: `Singing`
- Rank: `#1`
- Votes: `560,000`
- Followers: `920,000`
- Engagement: `8.2%`
- SDS: `94.8`
- Tier: `A`
- Integrity status: `verified`
- Integrity score: `97`
- Trending score: `91` (treat as trending)

### Sponsor context
- Sponsor name: `Zenith Bank`

### Existing campaign history row for Sarah M
- id: `track-001`
- contestantSlug: `sarah-m`
- sponsorName: `Zenith Bank`
- campaignStatus: `active`
- paymentStatus: `paid`
- deliverablesSubmitted: `3`
- deliverablesTotal: `5`
- adminNotes: `Strong visibility. Keep weekly proof cadence.`

## Page Structure (Must Match)

### 1) Header block inside content area
- Small label: `Sponsor Workspace`
- Main title: `Campaign Request & Tracking`

### 2) Main grid layout
Desktop: two columns
- Left column (~65% width): creation form
- Right column (~35% width): status/compliance/quick stats cards

Mobile/tablet:
- Single-column stack, preserving card hierarchy.

## Left Column: “Create Sponsorship Request” Card

Top row:
- Card title: `Create Sponsorship Request`
- Status badge on right (default: `Draft`)

### Section A: Campaign Basics
Fields:
- Contestant (readonly when query param exists)
  - Value: `Sarah M (sarah-m)`
  - Helper text: `Contestant is locked to the sponsorship target from the request.`
- Campaign Title (text input)
- Objective (select):
  - Awareness
  - Conversion
  - Engagement
- Duration (auto-calculated read-only output)
- Start Date (date input)
- End Date (date input)

### Section B: Budget & Payment
Fields:
- Agreed Price (USD) (number input)
- Payment Mode (read-only): `Manual Payment`
- Payment Reference (optional text input)
- Payment Status (read-only alert style): `Pending manual confirmation`

### Section C: Deliverables
- Section title + “Add Deliverable” button.
- Each deliverable row contains:
  - Deliverable type select:
    - Feed post
    - Story
    - Reel/Video
    - Live mention
  - Quantity (number)
  - Platform select:
    - Instagram
    - TikTok
    - Facebook
    - Snapchat
    - X
    - YouTube
  - Due date (date)
  - Remove icon button
- Default one starter row should be visible.
- Include “Special Instructions” textarea below rows.

### Section D: Platform & Compliance
Copy:
- `Social handles snapshot is readonly during active campaigns.`

Checkboxes:
- `I understand social usernames are locked during campaign.`
- `I accept sponsorship terms and policy conditions.`

### Section E: Review Summary
Summary boxes:
- Contestant
- Duration
- Deliverables count
- Total Price

### Form Actions
Buttons:
- `Save Draft` (secondary/outline)
- `Submit for Admin Review` (primary)

## Right Column Cards

### Card 1: Status Flow
Show chips/badges in this order:
- Draft
- Pending Admin Review
- Pending Payment (Manual)
- Active
- Under Review
- Completed
- Rejected

Use clear color coding by state.

### Card 2: Contestant Quick Stats
Show small stat tiles:
- SDS: `94.8`
- Tier: `A`
- Integrity: `97`
- Trending: `Yes`

Text note:
- `Sponsorship metrics do NOT affect voting rank.`

Because Sarah is verified, no warning banner is needed.  
If showing alternate state examples, warning copy for non-verified:
- `Integrity warning: contestant is under review/flagged.`

### Card 3: Recent Campaign History
Show up to 3 compact rows/chips. Include the Sarah row:
- Sponsor: Zenith Bank
- Campaign status: Active
- Payment badge: Paid

## Lower Section: Full Campaign Tracking List
Below top grid, show larger campaign cards/table rows.
Each campaign item should show:
- Sponsor name
- Contestant slug
- Campaign status badge
- Payment status badge
- Metrics:
  - Deliverables submitted/total
  - Payment status
  - Admin notes
- Conditional alerts:
  - Pending manual payment alert (amber)
  - Under review integrity alert (red)
- Performance summary block appears only when available:
  - Impressions
  - Clicks
  - CTR

For Sarah’s default sample row, show:
- Deliverables `3/5`
- Payment `paid`
- Admin note `Strong visibility. Keep weekly proof cadence.`
- No performance summary (unless you add optional hypothetical completed row)

## Interaction States To Visualize
- Default draft state
- Submit-disabled state (required fields missing)
- Submit-enabled state (all required complete + checkboxes checked)
- Locked contestant control state
- Empty history state (optional alternate)
- Loading shimmer/skeleton (optional alternate)

## Validation Rules (for UX notes/callouts)
Submit requires:
- contestant selected
- campaign title
- start date + end date
- agreed price > 0
- at least 1 deliverable
- lock acknowledgement checked
- terms accepted checked

## Visual Direction
Design style should feel:
- Premium sponsor operations dashboard
- Trust/compliance-focused
- Clear hierarchy and strong scannability

Color direction:
- Base: slate/neutral surfaces
- Brand accents: navy/blue
- CTA accent: gold/amber
- Semantic colors for status:
  - Success/paid/completed: green
  - Pending/manual: amber
  - Under review/risk: red
  - Info/active: blue

Typography:
- Clean sans-serif
- Strong section headers
- Compact readable form labels

Card style:
- Rounded corners (12-16px)
- Soft borders
- Subtle shadows
- Comfortable spacing

## Responsive Requirements
- Desktop: two-column workflow + tracking list below
- Tablet: two columns if space allows, otherwise stacked
- Mobile: single column, sticky bottom action buttons preferred
- Preserve readability of deliverables rows (horizontal scroll acceptable on very small widths)

## Output Required From AI Mockup Tool
Generate:
1. Full page mockup (desktop)
2. Mobile variant
3. Optional component closeups:
   - Deliverable row
   - Status badges
   - Campaign tracking row/card
4. Optional interaction frame showing locked contestant + enabled submit state

## Optional Prompt Snippet (Copy/Paste)
Design a high-fidelity sponsor campaign request and tracking page for a web app route `/sponsors/campaigns?contestant=sarah-m`. Use a premium navy/slate/amber dashboard style with a top sponsor portal shell and left sidebar. Main content: left column form card (“Create Sponsorship Request”) with sections Campaign Basics, Budget & Payment, Deliverables, Platform & Compliance, Review Summary, and actions Save Draft + Submit for Admin Review. Right column cards: Status Flow chips, Contestant Quick Stats (SDS 94.8, Tier A, Integrity 97, Trending Yes), and Recent Campaign History including Zenith Bank active paid row. Below, include full campaign tracking cards with status/payment badges, admin notes, deliverables progress, and conditional alerts for pending manual payment or under review. Contestant is locked to Sarah M, readonly in dropdown. Ensure desktop and mobile mockups with clear spacing, strong hierarchy, and compliance-focused visual language.

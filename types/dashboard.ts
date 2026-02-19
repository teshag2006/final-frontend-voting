// Auto-generated lightweight type stubs for missing @/types modules.
// Replace with concrete domain types as needed.

export type DailyVote = any;
export type DashboardOverviewData = any;
export type EventDetails = any;
export type FraudAlert = any;
export type FraudDetectionMetrics = any;
export type GeographicData = any;
export type Notification = any;
export type PaymentMethodBreakdown = any;
export type RankingData = any;
export type RevenueMetrics = any;
export type RevenueSnapshot = any;

export interface SponsorVisibility {
  sponsor_id?: string;
  sponsor_name: string;
  event_slug?: string;
  contestant_slug?: string;
  campaign_period?: string;
  placement_slot?: string;
  placement_status?: 'active' | 'paused' | 'ended';
  approved?: boolean;
  impressions: number;
  engagement_metrics: number;
  clicks?: number;
  click_through_rate?: number;
}

export type TrustSecurityMetrics = any;
export type VPNProxyActivity = any;
export type VoteDistributionByHour = any;

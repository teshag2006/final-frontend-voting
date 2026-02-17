import type { Metadata } from 'next';
import { AdminHeader } from '@/components/admin/admin-header';
import { HealthOverallStatus } from '@/components/admin/health-overall-status';
import { HealthCoreServices } from '@/components/admin/health-core-services';
import { HealthIntegrations } from '@/components/admin/health-integrations';
import { HealthResourceMetrics } from '@/components/admin/health-resource-metrics';
import { HealthWebhooks } from '@/components/admin/health-webhooks';
import { HealthMaintenanceControls } from '@/components/admin/health-maintenance-controls';
import {
  generateSystemHealthOverview,
  generateCoreServices,
  generateExternalIntegrations,
  generateResourceMetrics,
  generateWebhookStatus,
} from '@/lib/health-monitor-mock';

export const metadata: Metadata = {
  title: 'System Health Monitor - Admin Dashboard',
  description: 'Real-time system health monitoring, service status, and maintenance controls',
};

export default function HealthMonitorPage() {
  // Generate all mock data
  const systemHealth = generateSystemHealthOverview();
  const coreServices = generateCoreServices();
  const integrations = generateExternalIntegrations();
  const resources = generateResourceMetrics();
  const webhooks = generateWebhookStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <AdminHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">System Health Monitor</h1>
          <p className="text-muted-foreground">
            Real-time visibility into system performance, service connectivity, and resource utilization
          </p>
        </div>

        {/* Section 1: Overall Status */}
        <HealthOverallStatus data={systemHealth} />

        {/* Section 2: Core Services */}
        <HealthCoreServices services={coreServices} />

        {/* Section 3: External Integrations */}
        <HealthIntegrations integrations={integrations} />

        {/* Section 4: Resource Metrics */}
        <HealthResourceMetrics metrics={resources} />

        {/* Section 5: Webhooks & Callbacks */}
        <HealthWebhooks webhooks={webhooks} />

        {/* Section 6: Maintenance Controls */}
        <HealthMaintenanceControls isAdmin={true} isSuperAdmin={true} />
      </main>
    </div>
  );
}

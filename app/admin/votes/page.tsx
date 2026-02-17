'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VoteStatsDashboard } from '@/components/admin/vote-stats-dashboard';
import { VoteLiveTable } from '@/components/admin/vote-live-table';
import { VoteFraudAlertsPanel } from '@/components/admin/vote-fraud-alerts-panel';
import { generateMockVotes, getVoteStats, generateMockFraudAlerts, generateMockSuspiciousIps, generateMockPaymentGatewayAlerts } from '@/lib/vote-monitoring-mock';
import { Vote, VoteStats, FraudAlert, SuspiciousIP, VoteFilters, PaymentGatewayAlert } from '@/types/vote-monitoring';
import { AlertTriangle, Download, RefreshCw, Lock, AlertOctagon } from 'lucide-react';

export default function VoteMonitoringPage() {
  const [stats, setStats] = useState<VoteStats | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [suspiciousIps, setSuspiciousIps] = useState<SuspiciousIP[]>([]);
  const [paymentAlerts, setPaymentAlerts] = useState<PaymentGatewayAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<VoteFilters>({ suspiciousOnly: false });
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats(getVoteStats());
      setVotes(generateMockVotes(50));
      setAlerts(generateMockFraudAlerts(8));
      setSuspiciousIps(generateMockSuspiciousIps(5));
      setPaymentAlerts(generateMockPaymentGatewayAlerts());
      setIsLoading(false);
    };

    fetchData();

    // Auto-refresh every 5 seconds if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setStats(getVoteStats());
    setVotes(generateMockVotes(50));
    setIsLoading(false);
  };

  const handleBlockIp = (ipAddress: string) => {
    console.log(`Blocking IP: ${ipAddress}`);
    // API: POST /admin/votes/block-ip
  };

  const handleMarkReviewed = (alertId: string) => {
    console.log(`Marking alert reviewed: ${alertId}`);
    // API: POST /admin/votes/mark-reviewed
  };

  const handleFreezeContestant = (contestantId: string) => {
    console.log(`Freezing contestant: ${contestantId}`);
    // API: POST /admin/votes/freeze-contestant
  };

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    console.log(`Exporting as ${format}...`);
    // API: GET /admin/votes/export?format={format}&filters={JSON.stringify(filters)}
  };

  const hasPaymentAlert = paymentAlerts.some(a => a.status !== 'HEALTHY');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Vote Monitoring</h1>
            <p className="text-slate-600 mt-1">Real-time vote tracking and fraud detection system</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? 'default' : 'outline'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-Refresh' : 'Refresh'}
            </Button>
            <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Now
            </Button>
            <Button variant="outline" className="bg-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Payment Gateway Alert */}
        {hasPaymentAlert && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Payment Gateway Alert:</strong> One or more payment gateways experiencing delays. Monitor closely.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Dashboard */}
        {stats && <VoteStatsDashboard stats={stats} isLoading={isLoading} />}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Vote Table */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs defaultValue="votes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="votes">Live Votes</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>

              {/* Votes Tab */}
              <TabsContent value="votes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vote Activity</CardTitle>
                    <CardDescription>
                      {filters.suspiciousOnly
                        ? 'Showing suspicious votes only'
                        : `Showing ${votes.length} recent votes`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VoteLiveTable
                      votes={
                        filters.suspiciousOnly
                          ? votes.filter(v => v.fraudScore > 50)
                          : votes
                      }
                      isLoading={isLoading}
                      onViewDetails={(vote) => setSelectedVote(vote)}
                      onBlockIp={handleBlockIp}
                      onFlagVote={(voteId) => console.log(`Flagged: ${voteId}`)}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Filters Tab */}
              <TabsContent value="filters" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Event</label>
                        <select className="w-full px-3 py-2 border rounded-md mt-1 text-sm">
                          <option value="">All Events</option>
                          <option value="event_1">Event 1</option>
                          <option value="event_2">Event 2</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Contestant</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-md mt-1 text-sm"
                          placeholder="Search contestant..."
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Payment Status</label>
                        <select className="w-full px-3 py-2 border rounded-md mt-1 text-sm">
                          <option value="">All Status</option>
                          <option value="PAID">Paid</option>
                          <option value="PENDING">Pending</option>
                          <option value="FAILED">Failed</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Vote Source</label>
                        <select className="w-full px-3 py-2 border rounded-md mt-1 text-sm">
                          <option value="">All Sources</option>
                          <option value="WEB">Web</option>
                          <option value="MOBILE">Mobile</option>
                          <option value="API">API</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <input type="date" className="w-full px-3 py-2 border rounded-md mt-1 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date</label>
                        <input type="date" className="w-full px-3 py-2 border rounded-md mt-1 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="suspicious"
                        checked={filters.suspiciousOnly || false}
                        onChange={(e) => setFilters({ ...filters, suspiciousOnly: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="suspicious" className="text-sm font-medium cursor-pointer">
                        Show suspicious votes only
                      </label>
                    </div>
                    <Button className="w-full">Apply Filters</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Alerts */}
          <div className="space-y-4">
            <VoteFraudAlertsPanel
              alerts={alerts}
              suspiciousIps={suspiciousIps}
              isLoading={isLoading}
              onMarkReviewed={handleMarkReviewed}
              onBlockIp={handleBlockIp}
            />
          </div>
        </div>

        {/* Vote Details Modal */}
        {selectedVote && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <CardTitle>Vote Details</CardTitle>
                <CardDescription>Full vote information and audit trail</CardDescription>
              </div>
              <button
                onClick={() => setSelectedVote(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Vote ID</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1 font-mono">{selectedVote.voteId}</p>
                </div>
                <div>
                  <label className="font-semibold">Contestant</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1">{selectedVote.contestantId}</p>
                </div>
                <div>
                  <label className="font-semibold">Voter IP</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1 font-mono">{selectedVote.voterIp}</p>
                </div>
                <div>
                  <label className="font-semibold">Fraud Score</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1">{selectedVote.fraudScore.toFixed(1)}/100</p>
                </div>
                <div>
                  <label className="font-semibold">Payment Status</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1">{selectedVote.paymentStatus}</p>
                </div>
                <div>
                  <label className="font-semibold">Vote Source</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1">{selectedVote.source}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBlockIp(selectedVote.voterIp)}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Block IP
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFreezeContestant(selectedVote.contestantId)}
                >
                  <AlertOctagon className="w-4 h-4 mr-2" />
                  Freeze Contestant
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>Export vote data with applied filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleExport('CSV')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => handleExport('EXCEL')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button onClick={() => handleExport('PDF')} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

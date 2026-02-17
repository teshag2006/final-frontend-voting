'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BlockchainStatusBadge } from '@/components/admin/blockchain-status-badge';
import { BlockchainSummaryCards } from '@/components/admin/blockchain-summary-cards';
import { BlockchainAnchorsTable } from '@/components/admin/blockchain-anchors-table';
import { generateMockAnchorRecords, getBlockchainSummary, generateMockSnapshotDetail } from '@/lib/blockchain-monitor-mock';
import { AnchorRecord, BlockchainSummary, SnapshotDetail, AnchorFilters } from '@/types/blockchain-monitor';
import { AlertTriangle, RefreshCw, Zap, Link2, CheckCircle2 } from 'lucide-react';

export default function BlockchainMonitorPage() {
  const [summary, setSummary] = useState<BlockchainSummary | null>(null);
  const [records, setRecords] = useState<AnchorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AnchorFilters>({});
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotDetail | null>(null);
  const [verificationInput, setVerificationInput] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSummary(getBlockchainSummary());
      setRecords(generateMockAnchorRecords(50));
      setIsLoading(false);
    };

    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSummary(getBlockchainSummary());
    setRecords(generateMockAnchorRecords(50));
    setIsLoading(false);
  };

  const handleAnchorDaily = async () => {
    // API: POST /admin/blockchain/anchor/daily
    console.log('Anchoring daily snapshot...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleAnchorEvent = async () => {
    // API: POST /admin/blockchain/anchor/event/:eventId
    console.log('Anchoring event final...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleRetry = async (anchorId: string) => {
    // API: POST /admin/blockchain/anchors/:anchorId/retry
    console.log(`Retrying anchor: ${anchorId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handleVerifyHash = (record: AnchorRecord) => {
    setSelectedSnapshot(generateMockSnapshotDetail());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Blockchain Anchoring Monitor</h1>
            <p className="text-slate-600 mt-1">Integrity verification & anchoring control</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAnchorDaily} className="bg-blue-600 hover:bg-blue-700">
              <Zap className="w-4 h-4 mr-2" />
              Anchor Daily Snapshot
            </Button>
            <Button onClick={handleAnchorEvent} variant="outline">
              <Link2 className="w-4 h-4 mr-2" />
              Anchor Event Final
            </Button>
            <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && <BlockchainSummaryCards summary={summary} isLoading={isLoading} />}

        {/* Main Content Tabs */}
        <Tabs defaultValue="anchors" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
            <TabsTrigger value="anchors">Anchors</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="verify">Verify Hash</TabsTrigger>
            <TabsTrigger value="help" className="hidden md:inline-flex">Help</TabsTrigger>
          </TabsList>

          {/* Anchors Tab */}
          <TabsContent value="anchors" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Anchor Records</CardTitle>
                <CardDescription>All blockchain anchoring transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainAnchorsTable
                  records={records}
                  isLoading={isLoading}
                  onViewSnapshot={(record) => setSelectedSnapshot(generateMockSnapshotDetail())}
                  onRetry={handleRetry}
                  onVerifyHash={handleVerifyHash}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filters Tab */}
          <TabsContent value="filters" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Filter Anchors</CardTitle>
                <CardDescription>Refine your view of anchor records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Anchor Type</label>
                    <select className="w-full px-3 py-2 border rounded-md mt-1 text-sm">
                      <option value="">All Types</option>
                      <option value="VOTES">Votes</option>
                      <option value="PAYMENTS">Payments</option>
                      <option value="EVENT_FINAL">Event Final</option>
                      <option value="FRAUD">Fraud</option>
                      <option value="REPORT">Report</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select className="w-full px-3 py-2 border rounded-md mt-1 text-sm">
                      <option value="">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Blockchain Network</label>
                    <select className="w-full px-3 py-2 border rounded-md mt-1 text-sm">
                      <option value="">All Networks</option>
                      <option value="ETHEREUM">Ethereum</option>
                      <option value="POLYGON">Polygon</option>
                      <option value="ARBITRUM">Arbitrum</option>
                      <option value="OPTIMISM">Optimism</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <input type="date" className="w-full px-3 py-2 border rounded-md mt-1 text-sm" />
                  </div>
                </div>
                <Button className="w-full">Apply Filters</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verify Hash Tab */}
          <TabsContent value="verify" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Integrity Verification</CardTitle>
                <CardDescription>Paste a snapshot to verify its integrity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Snapshot JSON</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md mt-1 text-sm font-mono"
                    rows={6}
                    placeholder="Paste snapshot JSON here..."
                    value={verificationInput}
                    onChange={(e) => setVerificationInput(e.target.value)}
                  />
                </div>
                <Button className="w-full">Generate & Verify Hash</Button>

                {selectedSnapshot && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <div className="font-semibold">Hash Match Verified</div>
                      <code className="text-xs bg-white px-2 py-1 rounded block mt-2 break-all">
                        {selectedSnapshot.generatedHash}
                      </code>
                      <div className="text-xs mt-2">Transaction: {selectedSnapshot.blockchainTransactionHash.slice(0, 16)}...</div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Help Tab */}
          <TabsContent value="help" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>About Blockchain Anchoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>The Blockchain Monitor page allows you to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View all anchoring records with status tracking</li>
                  <li>Trigger manual daily and event-final anchoring</li>
                  <li>Monitor anchor failures and retry failed anchors</li>
                  <li>Verify transaction integrity with hash comparison</li>
                  <li>Inspect snapshot details and blockchain transactions</li>
                </ul>
                <p className="pt-2">
                  The system automatically polls blockchain status every 30 seconds. Manual anchoring requires ADMIN role.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Snapshot Detail Modal */}
        {selectedSnapshot && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <CardTitle>Snapshot Details</CardTitle>
                <CardDescription>Full snapshot and blockchain verification</CardDescription>
              </div>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <label className="font-semibold">Generated Hash</label>
                <code className="block bg-white px-3 py-2 rounded border text-xs font-mono mt-1 break-all">
                  {selectedSnapshot.generatedHash}
                </code>
              </div>
              <div>
                <label className="font-semibold">Transaction Hash</label>
                <code className="block bg-white px-3 py-2 rounded border text-xs font-mono mt-1 break-all">
                  {selectedSnapshot.blockchainTransactionHash}
                </code>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold">Block Number</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1">{selectedSnapshot.blockNumber}</p>
                </div>
                <div>
                  <label className="font-semibold">Network</label>
                  <p className="bg-white px-3 py-2 rounded border mt-1">{selectedSnapshot.network}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditSummaryCards } from '@/components/admin/audit-summary-cards';
import { AuditLogsTable } from '@/components/admin/audit-logs-table';
import { AuditLogDetailModal } from '@/components/admin/audit-log-detail-modal';
import { generateAuditLogs, getAuditLogSummary } from '@/lib/audit-logs-mock';
import { type AuditLog } from '@/types/audit-logs';
import { Download, RefreshCw, Filter } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(generateAuditLogs(50));
  const [summary, setSummary] = useState(getAuditLogSummary());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;
  const filteredLogs = searchQuery
    ? logs.filter(
        (log) =>
          log.logId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resourceId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : logs;

  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLogs(generateAuditLogs(50));
    setSummary(getAuditLogSummary());
    setIsLoading(false);
  }, []);

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    // Simulate export
    const dataStr = format === 'json' ? JSON.stringify(logs, null, 2) : JSON.stringify(logs);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs.${format === 'json' ? 'json' : format === 'csv' ? 'csv' : 'xlsx'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">System-wide administrative activity tracking</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 flex-1">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filter
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            className="gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('excel')}
            className="gap-2 text-xs"
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <AuditSummaryCards data={summary} isLoading={isLoading} />

      {/* Logs Table */}
      <div className="space-y-4">
        <div>
          <Input
            placeholder="Search by Log ID, Actor, Module, or Resource ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All Logs ({filteredLogs.length})
            </TabsTrigger>
            <TabsTrigger value="high-risk">
              High Risk ({logs.filter((l) => l.riskLevel === 'HIGH').length})
            </TabsTrigger>
            <TabsTrigger value="failed">
              Failed ({logs.filter((l) => l.status === 'FAILED').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <AuditLogsTable logs={paginatedLogs} isLoading={isLoading} onViewDetails={handleViewDetails} />
          </TabsContent>

          <TabsContent value="high-risk">
            <AuditLogsTable
              logs={logs
                .filter((l) => l.riskLevel === 'HIGH')
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>

          <TabsContent value="failed">
            <AuditLogsTable
              logs={logs
                .filter((l) => l.status === 'FAILED')
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)} to{' '}
            {Math.min(currentPage * pageSize, filteredLogs.length)} of {filteredLogs.length} logs
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage * pageSize >= filteredLogs.length}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <AuditLogDetailModal log={selectedLog} isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} />
    </div>
  );
}

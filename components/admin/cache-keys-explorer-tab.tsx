'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CacheKey } from '@/types/cache-monitor';
import { Search, Trash2, Eye } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface CacheKeysExplorerTabProps {
  keys: CacheKey[];
  isLoading?: boolean;
  onDeleteKey?: (key: string) => Promise<void>;
  isSuperAdmin?: boolean;
}

export function CacheKeysExplorerTab({
  keys,
  isLoading = false,
  onDeleteKey,
  isSuperAdmin = false,
}: CacheKeysExplorerTabProps) {
  const [searchPattern, setSearchPattern] = useState('');
  const [namespaceFilter, setNamespaceFilter] = useState('all');
  const [ttlFilter, setTtlFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  const namespaces = useMemo(() => {
    return Array.from(new Set(keys.map((k) => k.namespace)));
  }, [keys]);

  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      const matchesSearch =
        searchPattern === '' || k.key.toLowerCase().includes(searchPattern.toLowerCase());
      const matchesNamespace = namespaceFilter === 'all' || k.namespace === namespaceFilter;
      const matchesTTL =
        ttlFilter === 'all' ||
        (ttlFilter === 'expiring' && k.ttl > 0) ||
        (ttlFilter === 'persistent' && k.ttl === -1);

      return matchesSearch && matchesNamespace && matchesTTL;
    });
  }, [keys, searchPattern, namespaceFilter, ttlFilter]);

  const totalPages = Math.ceil(filteredKeys.length / ITEMS_PER_PAGE);
  const paginatedKeys = filteredKeys.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleDelete = async (key: string) => {
    if (!onDeleteKey) return;
    setDeletingKey(key);
    try {
      await onDeleteKey(key);
    } catch (error) {
      console.error('Failed to delete key:', error);
    } finally {
      setDeletingKey(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTTL = (ttl: number) => {
    if (ttl === -1) return 'Persistent';
    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m`;
    return `${Math.floor(ttl / 3600)}h`;
  };

  if (isLoading) {
    return <div className="h-96 rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keys..."
                value={searchPattern}
                onChange={(e) => {
                  setSearchPattern(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={namespaceFilter} onValueChange={(v) => setPage(1) || setNamespaceFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by namespace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Namespaces</SelectItem>
                {namespaces.map((ns) => (
                  <SelectItem key={ns} value={ns}>
                    {ns}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ttlFilter} onValueChange={(v) => setPage(1) || setTtlFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by TTL" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All TTLs</SelectItem>
                <SelectItem value="expiring">Expiring</SelectItem>
                <SelectItem value="persistent">Persistent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {paginatedKeys.length > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0} to{' '}
          {Math.min(page * ITEMS_PER_PAGE, filteredKeys.length)} of {filteredKeys.length} keys
        </p>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>TTL</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Accessed</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No keys found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedKeys.map((key) => (
                <TableRow key={key.key}>
                  <TableCell className="font-mono text-sm max-w-xs truncate">{key.key}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{key.type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatTTL(key.ttl)}</TableCell>
                  <TableCell className="text-sm">{formatBytes(key.size)}</TableCell>
                  <TableCell className="text-sm">
                    {key.lastAccessed.toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View key details"
                        disabled
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isSuperAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              title="Delete key"
                              disabled={deletingKey === key.key}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Key</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <code className="text-foreground">{key.key}</code>? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="flex justify-end gap-2">
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(key.key)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

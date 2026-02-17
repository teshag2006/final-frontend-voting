'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type AuditLogSummary } from '@/types/audit-logs';
import { AlertTriangle, Shield, XCircle, Users, CreditCard, Link2 } from 'lucide-react';

interface AuditSummaryCardsProps {
  data?: AuditLogSummary;
  isLoading?: boolean;
}

export function AuditSummaryCards({ data, isLoading }: AuditSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Logs Today',
      value: data?.totalLogsToday ?? 0,
      icon: AlertTriangle,
      color: 'bg-blue-100 dark:bg-blue-950',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Security Events',
      value: data?.securityEvents ?? 0,
      icon: Shield,
      color: 'bg-green-100 dark:bg-green-950',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Failed Operations',
      value: data?.failedOperations ?? 0,
      icon: XCircle,
      color: 'bg-red-100 dark:bg-red-950',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'Role Changes',
      value: data?.roleChanges ?? 0,
      icon: Users,
      color: 'bg-purple-100 dark:bg-purple-950',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Payment Actions',
      value: data?.paymentActions ?? 0,
      icon: CreditCard,
      color: 'bg-orange-100 dark:bg-orange-950',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Blockchain Events',
      value: data?.blockchainEvents ?? 0,
      icon: Link2,
      color: 'bg-indigo-100 dark:bg-indigo-950',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

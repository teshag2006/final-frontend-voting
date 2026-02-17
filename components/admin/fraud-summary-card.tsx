import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FraudSummaryCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  description?: string;
  bgColor?: string;
  textColor?: string;
  isLoading?: boolean;
}

export function FraudSummaryCard({
  icon: Icon,
  title,
  value,
  change,
  description,
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-600',
  isLoading = false,
}: FraudSummaryCardProps) {
  return (
    <Card className={`${bgColor} border-0 p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {isLoading ? (
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
          ) : (
            <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className={`${textColor} opacity-20`}>
          <Icon className="h-12 w-12" />
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              change.direction === 'up'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {change.direction === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
          </span>
          <span className="text-xs text-muted-foreground">vs last 24h</span>
        </div>
      )}
    </Card>
  );
}

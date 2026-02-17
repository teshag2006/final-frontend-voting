import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
}

export function AdminStatsCard({
  label,
  value,
  trend,
  trendPositive = false,
}: AdminStatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p className={`text-sm font-medium mt-2 ${trendPositive ? 'text-green-600' : 'text-slate-600'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${trendPositive ? 'bg-green-100' : 'bg-slate-100'}`}>
          {trendPositive ? (
            <TrendingUp className={`h-6 w-6 ${trendPositive ? 'text-green-600' : 'text-slate-600'}`} />
          ) : (
            <TrendingDown className="h-6 w-6 text-slate-600" />
          )}
        </div>
      </div>
    </Card>
  );
}

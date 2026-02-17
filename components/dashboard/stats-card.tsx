import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  subtext?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  subtext,
  className = '',
}: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-accent">{icon}</div>}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-3xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {trend.value}%
          </div>
        )}
      </div>

      {/* Subtext */}
      {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
    </div>
  );
}

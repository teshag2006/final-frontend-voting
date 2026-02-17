import { Badge } from '@/components/ui/badge';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const riskConfig: Record<RiskLevel, { label: string; className: string; description: string }> = {
  LOW: {
    label: 'Low Risk',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
    description: 'Score 0-30: Minimal fraud indicators',
  },
  MEDIUM: {
    label: 'Medium Risk',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    description: 'Score 31-60: Some suspicious activity',
  },
  HIGH: {
    label: 'High Risk',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    description: 'Score 61-80: Likely fraudulent behavior',
  },
  CRITICAL: {
    label: 'Critical',
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
    description: 'Score 81-100: Immediate action required',
  },
};

interface FraudRiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  compact?: boolean;
}

export function FraudRiskBadge({
  level,
  score,
  showScore = false,
  compact = false,
}: FraudRiskBadgeProps) {
  const config = riskConfig[level];

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={`${config.className} font-semibold cursor-help`}
        title={config.description}
      >
        {compact ? level[0] : config.label}
      </Badge>
      {showScore && score !== undefined && (
        <span className="text-xs text-muted-foreground font-mono">
          {score}/100
        </span>
      )}
    </div>
  );
}

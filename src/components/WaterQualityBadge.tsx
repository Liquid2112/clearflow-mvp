'use client';

import { WaterSystem } from '@/lib/db';

interface Props {
  status: string;
  waterSystem?: WaterSystem | null;
}

export default function WaterQualityBadge({ status, waterSystem }: Props) {
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    no_recent_violation: {
      label: 'No recent violations',
      color: 'text-green-700',
      bg: 'bg-green-100 border-green-200',
    },
    historical_violation: {
      label: 'Historical violation',
      color: 'text-red-700',
      bg: 'bg-red-100 border-red-200',
    },
    monitoring_reporting_issue: {
      label: 'Monitoring issue',
      color: 'text-amber-700',
      bg: 'bg-amber-100 border-amber-200',
    },
    data_needs_review: {
      label: 'Data needs review',
      color: 'text-gray-700',
      bg: 'bg-gray-100 border-gray-200',
    },
  };

  const config = statusConfig[status] || statusConfig.data_needs_review;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${config.bg}`}>
      <span className={config.color}>{config.label}</span>
    </div>
  );
}

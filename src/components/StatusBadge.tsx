import { STATUS_LABELS, CONDITION_LABELS } from '../types';
import type { AssetStatus, AssetCondition } from '../types';

const statusColors: Record<AssetStatus, string> = {
  active: 'bg-green-100 text-green-700',
  'in-repair': 'bg-yellow-100 text-yellow-700',
  retired: 'bg-gray-100 text-gray-600',
  disposed: 'bg-red-100 text-red-700',
};

const conditionColors: Record<AssetCondition, string> = {
  new: 'bg-blue-100 text-blue-700',
  good: 'bg-green-100 text-green-700',
  fair: 'bg-yellow-100 text-yellow-700',
  poor: 'bg-orange-100 text-orange-700',
  damaged: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: AssetCondition }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conditionColors[condition]}`}>
      {CONDITION_LABELS[condition]}
    </span>
  );
}

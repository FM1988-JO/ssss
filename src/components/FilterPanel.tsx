import type { AssetFilters, AssetCategory, AssetStatus, AssetCondition } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS, CONDITION_LABELS } from '../types';
import { useAssets } from '../context/AssetContext';

interface Props {
  filters: AssetFilters;
  onChange: (filters: AssetFilters) => void;
}

export default function FilterPanel({ filters, onChange }: Props) {
  const { settings } = useAssets();

  const set = (key: keyof AssetFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const activeCount = [
    filters.category !== 'all',
    filters.status !== 'all',
    filters.condition !== 'all',
    filters.department !== '',
    filters.location !== '',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select
        value={filters.category}
        onChange={(e) => set('category', e.target.value)}
        className={`px-3 py-2 border rounded-lg text-sm ${
          filters.category !== 'all' ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200'
        }`}
      >
        <option value="all">All Categories</option>
        {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map((k) => (
          <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(e) => set('status', e.target.value)}
        className={`px-3 py-2 border rounded-lg text-sm ${
          filters.status !== 'all' ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200'
        }`}
      >
        <option value="all">All Statuses</option>
        {(Object.keys(STATUS_LABELS) as AssetStatus[]).map((k) => (
          <option key={k} value={k}>{STATUS_LABELS[k]}</option>
        ))}
      </select>

      <select
        value={filters.condition}
        onChange={(e) => set('condition', e.target.value)}
        className={`px-3 py-2 border rounded-lg text-sm ${
          filters.condition !== 'all' ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200'
        }`}
      >
        <option value="all">All Conditions</option>
        {(Object.keys(CONDITION_LABELS) as AssetCondition[]).map((k) => (
          <option key={k} value={k}>{CONDITION_LABELS[k]}</option>
        ))}
      </select>

      <select
        value={filters.department}
        onChange={(e) => set('department', e.target.value)}
        className={`px-3 py-2 border rounded-lg text-sm ${
          filters.department ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200'
        }`}
      >
        <option value="">All Departments</option>
        {settings.departments.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={filters.location}
        onChange={(e) => set('location', e.target.value)}
        className={`px-3 py-2 border rounded-lg text-sm ${
          filters.location ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-gray-200'
        }`}
      >
        <option value="">All Locations</option>
        {settings.locations.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      {activeCount > 0 && (
        <button
          onClick={() =>
            onChange({ search: filters.search, category: 'all', status: 'all', condition: 'all', department: '', location: '' })
          }
          className="px-3 py-2 text-sm text-danger-500 hover:bg-red-50 rounded-lg"
        >
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
}

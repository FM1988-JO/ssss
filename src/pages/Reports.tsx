import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import type { AssetFilters } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS, CONDITION_LABELS } from '../types';
import { useSearch, defaultFilters } from '../hooks/useSearch';
import { useExport } from '../hooks/useExport';
import FilterPanel from '../components/FilterPanel';
import { formatCurrency } from '../utils/formatters';

export default function Reports() {
  const { assets, settings } = useAssets();
  const [filters, setFilters] = useState<AssetFilters>(defaultFilters);
  const filtered = useSearch(assets, filters);
  const { exportCSV, printAssets } = useExport();

  const totalValue = filtered.reduce((sum, a) => sum + (a.purchasePrice || 0), 0);
  const byCategory: Record<string, { count: number; value: number }> = {};
  for (const a of filtered) {
    if (!byCategory[a.category]) byCategory[a.category] = { count: 0, value: 0 };
    byCategory[a.category].count++;
    byCategory[a.category].value += a.purchasePrice || 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} assets selected</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => printAssets(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      <FilterPanel filters={filters} onChange={setFilters} />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Assets</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue, settings.defaultCurrency)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{Object.keys(byCategory).length}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Count</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total Value</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Avg Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(byCategory).map(([cat, data]) => (
              <tr key={cat} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{data.count}</td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatCurrency(data.value, settings.defaultCurrency)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatCurrency(data.count > 0 ? data.value / data.count : 0, settings.defaultCurrency)}
                </td>
              </tr>
            ))}
            {Object.keys(byCategory).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">By Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const count = filtered.filter((a) => a.status === status).length;
            return (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Condition Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">By Condition</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(CONDITION_LABELS).map(([cond, label]) => {
            const count = filtered.filter((a) => a.condition === cond).length;
            return (
              <div key={cond} className="text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

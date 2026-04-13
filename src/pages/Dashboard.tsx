import { Link } from 'react-router-dom';
import {
  Package,
  Monitor,
  Armchair,
  Car,
  Wrench,
  Building2,
  CheckCircle,
  AlertTriangle,
  Archive,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import { CATEGORY_LABELS } from '../types';
import type { AssetCategory } from '../types';
import StatCard from '../components/StatCard';
import AssetCard from '../components/AssetCard';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../utils/formatters';

const categoryIcons: Record<AssetCategory, typeof Monitor> = {
  'it-equipment': Monitor,
  furniture: Armchair,
  vehicles: Car,
  tools: Wrench,
  buildings: Building2,
  other: Package,
};

export default function Dashboard() {
  const { assets, getStats, settings } = useAssets();
  const stats = getStats();
  const recentAssets = assets.slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all company assets</p>
      </div>

      {assets.length === 0 ? (
        <EmptyState
          title="No assets yet"
          description="Start by adding your first asset to track and manage your company's equipment."
          action={
            <Link
              to="/assets/add"
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
            >
              Add First Asset
            </Link>
          }
        />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Assets"
              value={stats.total}
              icon={<Package className="w-5 h-5" />}
            />
            <StatCard
              title="Active"
              value={stats.byStatus['active'] || 0}
              icon={<CheckCircle className="w-5 h-5" />}
              color="bg-green-50 text-green-600"
            />
            <StatCard
              title="In Repair"
              value={stats.byStatus['in-repair'] || 0}
              icon={<AlertTriangle className="w-5 h-5" />}
              color="bg-yellow-50 text-yellow-600"
            />
            <StatCard
              title="Retired"
              value={stats.byStatus['retired'] || 0}
              icon={<Archive className="w-5 h-5" />}
              color="bg-gray-50 text-gray-600"
            />
            <StatCard
              title="Total Value"
              value={formatCurrency(stats.totalValue, settings.defaultCurrency)}
              icon={<DollarSign className="w-5 h-5" />}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              title="Expired Warranty"
              value={stats.expiredWarranties}
              icon={<ShieldAlert className="w-5 h-5" />}
              color="bg-red-50 text-red-600"
            />
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">By Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map((cat) => {
                const Icon = categoryIcons[cat];
                const count = stats.byCategory[cat] || 0;
                return (
                  <Link
                    key={cat}
                    to={`/assets?category=${cat}`}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-colors"
                  >
                    <Icon className="w-6 h-6 text-gray-500" />
                    <span className="text-xl font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500 text-center">{CATEGORY_LABELS[cat]}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Assets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Assets</h2>
              <Link to="/assets" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import type { AssetFilters, AssetCategory } from '../types';
import { useSearch, defaultFilters } from '../hooks/useSearch';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import AssetCard from '../components/AssetCard';
import EmptyState from '../components/EmptyState';
import { StatusBadge, ConditionBadge } from '../components/StatusBadge';
import { CATEGORY_LABELS } from '../types';

export default function AssetList() {
  const { assets } = useAssets();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<AssetFilters>(() => {
    const cat = searchParams.get('category');
    return {
      ...defaultFilters,
      category: cat && cat in CATEGORY_LABELS ? (cat as AssetCategory) : 'all',
    };
  });

  // Sync URL param
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat in CATEGORY_LABELS) {
      setFilters((f) => ({ ...f, category: cat as AssetCategory }));
    }
  }, [searchParams]);

  const filtered = useSearch(assets, filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} of {assets.length} assets
          </p>
        </div>
        <Link
          to="/assets/add"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <PlusCircle className="w-4 h-4" />
          Add Asset
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <SearchBar value={filters.search} onChange={(s) => setFilters((f) => ({ ...f, search: s }))} />
        <div className="flex items-center justify-between">
          <FilterPanel filters={filters} onChange={setFilters} />
          <div className="flex gap-1 ml-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Asset grid/list */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No assets found"
          description={assets.length === 0 ? 'Add your first asset to get started.' : 'Try adjusting your search or filters.'}
          action={
            assets.length === 0 ? (
              <Link
                to="/assets/add"
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
              >
                Add Asset
              </Link>
            ) : undefined
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Asset</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Condition</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/assets/${asset.id}`} className="hover:text-primary-600">
                      <p className="font-medium text-gray-900">{asset.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{asset.id}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{CATEGORY_LABELS[asset.category]}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{asset.location || '-'}</td>
                  <td className="px-4 py-3"><StatusBadge status={asset.status} /></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><ConditionBadge condition={asset.condition} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useMemo } from 'react';
import type { Asset, AssetFilters } from '../types';

const defaultFilters: AssetFilters = {
  search: '',
  category: 'all',
  status: 'all',
  condition: 'all',
  department: '',
  location: '',
};

export { defaultFilters };

export function useSearch(assets: Asset[], filters: AssetFilters): Asset[] {
  return useMemo(() => {
    let result = assets;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.brand.toLowerCase().includes(q) ||
          a.model.toLowerCase().includes(q) ||
          a.assignedTo.toLowerCase().includes(q) ||
          a.serialNumber.toLowerCase().includes(q) ||
          a.subcategory.toLowerCase().includes(q),
      );
    }

    if (filters.category !== 'all') {
      result = result.filter((a) => a.category === filters.category);
    }
    if (filters.status !== 'all') {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.condition !== 'all') {
      result = result.filter((a) => a.condition === filters.condition);
    }
    if (filters.department) {
      result = result.filter((a) => a.department === filters.department);
    }
    if (filters.location) {
      result = result.filter((a) => a.location === filters.location);
    }

    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [assets, filters]);
}

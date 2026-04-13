import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Asset, AssetCategory, AssetPhoto, AppSettings } from '../types';
import { CATEGORY_CODES } from '../types';
import { loadAssets, saveAssets, loadCounters, saveCounters, loadSettings, saveSettings, clearOldData } from '../utils/storage';
import { generateId } from '../utils/formatters';

interface AssetStats {
  total: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  totalValue: number;
  expiredWarranties: number;
}

interface AssetContextType {
  assets: Asset[];
  settings: AppSettings;
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Asset;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  getAsset: (id: string) => Asset | undefined;
  addPhoto: (assetId: string, photo: Omit<AssetPhoto, 'id'>) => void;
  removePhoto: (assetId: string, photoId: string) => void;
  setPrimaryPhoto: (assetId: string, photoId: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  generateAssetId: (category: AssetCategory) => string;
  getStats: () => AssetStats;
}

const AssetContext = createContext<AssetContextType | null>(null);

// Clean old onboarding data on first load
clearOldData();

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(loadAssets);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const persistAssets = useCallback((updater: (prev: Asset[]) => Asset[]) => {
    setAssets((prev) => {
      const next = updater(prev);
      saveAssets(next);
      return next;
    });
  }, []);

  const generateAssetId = useCallback((category: AssetCategory): string => {
    const counters = loadCounters();
    const code = CATEGORY_CODES[category];
    const current = counters[category] || 0;
    const next = current + 1;
    counters[category] = next;
    saveCounters(counters);
    return `AST-${code}-${String(next).padStart(5, '0')}`;
  }, []);

  const addAsset = useCallback(
    (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset => {
      const now = new Date().toISOString();
      const asset: Asset = {
        ...data,
        id: generateAssetId(data.category),
        createdAt: now,
        updatedAt: now,
      };
      persistAssets((prev) => [asset, ...prev]);
      return asset;
    },
    [generateAssetId, persistAssets],
  );

  const updateAsset = useCallback(
    (id: string, updates: Partial<Asset>) => {
      persistAssets((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a,
        ),
      );
    },
    [persistAssets],
  );

  const deleteAsset = useCallback(
    (id: string) => {
      persistAssets((prev) => prev.filter((a) => a.id !== id));
    },
    [persistAssets],
  );

  const getAsset = useCallback(
    (id: string) => assets.find((a) => a.id === id),
    [assets],
  );

  const addPhoto = useCallback(
    (assetId: string, photo: Omit<AssetPhoto, 'id'>) => {
      const newPhoto: AssetPhoto = { ...photo, id: generateId() };
      persistAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? { ...a, photos: [...a.photos, newPhoto], updatedAt: new Date().toISOString() }
            : a,
        ),
      );
    },
    [persistAssets],
  );

  const removePhoto = useCallback(
    (assetId: string, photoId: string) => {
      persistAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? { ...a, photos: a.photos.filter((p) => p.id !== photoId), updatedAt: new Date().toISOString() }
            : a,
        ),
      );
    },
    [persistAssets],
  );

  const setPrimaryPhoto = useCallback(
    (assetId: string, photoId: string) => {
      persistAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? {
                ...a,
                photos: a.photos.map((p) => ({ ...p, isPrimary: p.id === photoId })),
                updatedAt: new Date().toISOString(),
              }
            : a,
        ),
      );
    },
    [persistAssets],
  );

  const updateSettingsHandler = useCallback(
    (updates: Partial<AppSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...updates };
        saveSettings(next);
        return next;
      });
    },
    [],
  );

  const getStats = useCallback((): AssetStats => {
    const now = new Date();
    const stats: AssetStats = {
      total: assets.length,
      byCategory: {},
      byStatus: {},
      totalValue: 0,
      expiredWarranties: 0,
    };
    for (const a of assets) {
      stats.byCategory[a.category] = (stats.byCategory[a.category] || 0) + 1;
      stats.byStatus[a.status] = (stats.byStatus[a.status] || 0) + 1;
      stats.totalValue += a.purchasePrice || 0;
      if (a.warrantyExpiry && new Date(a.warrantyExpiry) < now) {
        stats.expiredWarranties++;
      }
    }
    return stats;
  }, [assets]);

  return (
    <AssetContext.Provider
      value={{
        assets,
        settings,
        addAsset,
        updateAsset,
        deleteAsset,
        getAsset,
        addPhoto,
        removePhoto,
        setPrimaryPhoto,
        updateSettings: updateSettingsHandler,
        generateAssetId,
        getStats,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error('useAssets must be used within AssetProvider');
  return ctx;
}

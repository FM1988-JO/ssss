import type { Asset, AppSettings } from '../types';
import { defaultSettings } from '../data/defaults';

const ASSETS_KEY = 'assets';
const COUNTERS_KEY = 'assetIdCounters';
const SETTINGS_KEY = 'appSettings';

export function loadAssets(): Asset[] {
  try {
    const raw = localStorage.getItem(ASSETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAssets(assets: Asset[]) {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
}

export function loadCounters(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCounters(counters: Record<string, number>) {
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function compressImage(dataUrl: string, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

export function getStorageUsage(): { used: number; total: number; percentage: number } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      used += (localStorage.getItem(key) || '').length * 2; // UTF-16
    }
  }
  const total = 5 * 1024 * 1024; // ~5MB typical limit
  return { used, total, percentage: Math.round((used / total) * 100) };
}

export function clearOldData() {
  // Remove old onboarding app data
  localStorage.removeItem('onboardingData');
  localStorage.removeItem('user');
  localStorage.removeItem('lang');
}

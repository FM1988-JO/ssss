export type AssetCategory =
  | 'it-equipment'
  | 'furniture'
  | 'vehicles'
  | 'tools'
  | 'buildings'
  | 'other';

export const CATEGORY_CODES: Record<AssetCategory, string> = {
  'it-equipment': 'IT',
  furniture: 'FN',
  vehicles: 'VH',
  tools: 'TL',
  buildings: 'BL',
  other: 'OT',
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  'it-equipment': 'IT Equipment',
  furniture: 'Furniture',
  vehicles: 'Vehicles',
  tools: 'Tools',
  buildings: 'Buildings & Facilities',
  other: 'Other',
};

export type AssetStatus = 'active' | 'in-repair' | 'retired' | 'disposed';
export type AssetCondition = 'new' | 'good' | 'fair' | 'poor' | 'damaged';

export const STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Active',
  'in-repair': 'In Repair',
  retired: 'Retired',
  disposed: 'Disposed',
};

export const CONDITION_LABELS: Record<AssetCondition, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  damaged: 'Damaged',
};

export interface AssetPhoto {
  id: string;
  dataUrl: string;
  caption: string;
  capturedAt: string;
  isPrimary: boolean;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subcategory: string;
  brand: string;
  model: string;
  serialNumber: string;
  location: string;
  department: string;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate: string;
  purchasePrice: number;
  currency: string;
  warrantyExpiry: string;
  assignedTo: string;
  notes: string;
  photos: AssetPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface AssetFilters {
  search: string;
  category: AssetCategory | 'all';
  status: AssetStatus | 'all';
  condition: AssetCondition | 'all';
  department: string;
  location: string;
}

export interface AppSettings {
  departments: string[];
  locations: string[];
  defaultCurrency: string;
  companyName: string;
  geminiApiKey: string;
}

export interface SubcategoryTemplate {
  subcategory: string;
  defaultFields: Partial<Pick<Asset, 'condition' | 'notes'>>;
  commonBrands: string[];
}

export interface CategoryDefinition {
  id: AssetCategory;
  label: string;
  icon: string;
  subcategories: SubcategoryTemplate[];
}

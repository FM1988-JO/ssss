import type { AppSettings } from '../types';

export const defaultSettings: AppSettings = {
  departments: [
    'Administration',
    'Finance',
    'Human Resources',
    'IT',
    'Marketing',
    'Operations',
    'Sales',
    'Maintenance',
    'Warehouse',
  ],
  locations: [
    'Head Office',
    'Branch Office',
    'Warehouse A',
    'Warehouse B',
    'Workshop',
    'Parking Lot',
  ],
  defaultCurrency: 'SAR',
  companyName: 'My Company',
  geminiApiKey: '',
};

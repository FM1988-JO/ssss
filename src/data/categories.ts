import type { CategoryDefinition } from '../types';

export const categories: CategoryDefinition[] = [
  {
    id: 'it-equipment',
    label: 'IT Equipment',
    icon: 'Monitor',
    subcategories: [
      {
        subcategory: 'Laptop',
        defaultFields: { condition: 'new' },
        commonBrands: ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Microsoft'],
      },
      {
        subcategory: 'Desktop',
        defaultFields: { condition: 'new' },
        commonBrands: ['Dell', 'HP', 'Lenovo', 'Apple'],
      },
      {
        subcategory: 'Monitor',
        defaultFields: { condition: 'new' },
        commonBrands: ['Dell', 'LG', 'Samsung', 'HP', 'BenQ', 'Asus'],
      },
      {
        subcategory: 'Printer',
        defaultFields: { condition: 'new' },
        commonBrands: ['HP', 'Brother', 'Canon', 'Epson', 'Xerox'],
      },
      {
        subcategory: 'Network Equipment',
        defaultFields: { condition: 'new' },
        commonBrands: ['Cisco', 'TP-Link', 'Netgear', 'Ubiquiti', 'Aruba'],
      },
      {
        subcategory: 'Phone / Tablet',
        defaultFields: { condition: 'new' },
        commonBrands: ['Apple', 'Samsung', 'Google', 'Huawei'],
      },
      {
        subcategory: 'Server',
        defaultFields: { condition: 'new' },
        commonBrands: ['Dell', 'HP', 'Lenovo', 'Supermicro'],
      },
      {
        subcategory: 'Other IT',
        defaultFields: {},
        commonBrands: [],
      },
    ],
  },
  {
    id: 'furniture',
    label: 'Furniture',
    icon: 'Armchair',
    subcategories: [
      {
        subcategory: 'Desk',
        defaultFields: {},
        commonBrands: ['IKEA', 'Steelcase', 'Herman Miller', 'HON'],
      },
      {
        subcategory: 'Chair',
        defaultFields: {},
        commonBrands: ['Herman Miller', 'Steelcase', 'IKEA', 'Secretlab'],
      },
      {
        subcategory: 'Cabinet / Shelving',
        defaultFields: {},
        commonBrands: ['IKEA', 'HON', 'Steelcase'],
      },
      {
        subcategory: 'Table',
        defaultFields: {},
        commonBrands: ['IKEA', 'Steelcase'],
      },
      {
        subcategory: 'Other Furniture',
        defaultFields: {},
        commonBrands: [],
      },
    ],
  },
  {
    id: 'vehicles',
    label: 'Vehicles',
    icon: 'Car',
    subcategories: [
      {
        subcategory: 'Sedan',
        defaultFields: {},
        commonBrands: ['Toyota', 'Hyundai', 'Honda', 'Nissan', 'Chevrolet', 'Ford', 'BMW', 'Mercedes'],
      },
      {
        subcategory: 'SUV',
        defaultFields: {},
        commonBrands: ['Toyota', 'Hyundai', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes'],
      },
      {
        subcategory: 'Truck',
        defaultFields: {},
        commonBrands: ['Toyota', 'Ford', 'Chevrolet', 'Isuzu', 'Mitsubishi'],
      },
      {
        subcategory: 'Van',
        defaultFields: {},
        commonBrands: ['Toyota', 'Mercedes', 'Ford', 'Hyundai'],
      },
      {
        subcategory: 'Heavy Equipment',
        defaultFields: {},
        commonBrands: ['Caterpillar', 'Komatsu', 'Volvo', 'JCB'],
      },
      {
        subcategory: 'Other Vehicle',
        defaultFields: {},
        commonBrands: [],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'Wrench',
    subcategories: [
      {
        subcategory: 'Power Tool',
        defaultFields: {},
        commonBrands: ['DeWalt', 'Makita', 'Bosch', 'Milwaukee', 'Hilti'],
      },
      {
        subcategory: 'Hand Tool',
        defaultFields: {},
        commonBrands: ['Stanley', 'Snap-on', 'Wera', 'Knipex'],
      },
      {
        subcategory: 'Measuring Instrument',
        defaultFields: {},
        commonBrands: ['Leica', 'Bosch', 'Fluke', 'Stanley'],
      },
      {
        subcategory: 'Safety Equipment',
        defaultFields: {},
        commonBrands: ['3M', 'Honeywell', 'MSA', 'Petzl'],
      },
      {
        subcategory: 'Other Tool',
        defaultFields: {},
        commonBrands: [],
      },
    ],
  },
  {
    id: 'buildings',
    label: 'Buildings & Facilities',
    icon: 'Building2',
    subcategories: [
      {
        subcategory: 'Office Building',
        defaultFields: {},
        commonBrands: [],
      },
      {
        subcategory: 'Warehouse',
        defaultFields: {},
        commonBrands: [],
      },
      {
        subcategory: 'HVAC System',
        defaultFields: {},
        commonBrands: ['Daikin', 'Carrier', 'Trane', 'LG', 'Samsung'],
      },
      {
        subcategory: 'Elevator / Lift',
        defaultFields: {},
        commonBrands: ['Otis', 'Schindler', 'ThyssenKrupp', 'KONE'],
      },
      {
        subcategory: 'Generator',
        defaultFields: {},
        commonBrands: ['Caterpillar', 'Cummins', 'Generac', 'Perkins'],
      },
      {
        subcategory: 'Other Facility',
        defaultFields: {},
        commonBrands: [],
      },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'Package',
    subcategories: [
      {
        subcategory: 'General',
        defaultFields: {},
        commonBrands: [],
      },
    ],
  },
];

export function getCategoryDefinition(id: string) {
  return categories.find((c) => c.id === id);
}

export function getSubcategoryTemplate(categoryId: string, subcategory: string) {
  const cat = getCategoryDefinition(categoryId);
  return cat?.subcategories.find((s) => s.subcategory === subcategory);
}

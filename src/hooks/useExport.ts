import { useCallback } from 'react';
import type { Asset } from '../types';
import { CATEGORY_LABELS, STATUS_LABELS, CONDITION_LABELS } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';

export function useExport() {
  const exportCSV = useCallback((assets: Asset[], filename = 'assets-report.csv') => {
    const headers = [
      'Asset ID',
      'Name',
      'Category',
      'Subcategory',
      'Brand',
      'Model',
      'Serial Number',
      'Location',
      'Department',
      'Status',
      'Condition',
      'Purchase Date',
      'Purchase Price',
      'Currency',
      'Warranty Expiry',
      'Assigned To',
      'Notes',
      'Created At',
    ];

    const rows = assets.map((a) => [
      a.id,
      a.name,
      CATEGORY_LABELS[a.category],
      a.subcategory,
      a.brand,
      a.model,
      a.serialNumber,
      a.location,
      a.department,
      STATUS_LABELS[a.status],
      CONDITION_LABELS[a.condition],
      formatDate(a.purchaseDate),
      a.purchasePrice?.toString() || '',
      a.currency,
      formatDate(a.warrantyExpiry),
      a.assignedTo,
      a.notes.replace(/"/g, '""'),
      formatDate(a.createdAt),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const printAssets = useCallback((assets: Asset[]) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Asset Report</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
          h1 { font-size: 18px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; }
          .meta { color: #6b7280; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <h1>Asset Report</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()} | Total: ${assets.length} assets</p>
        <table>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand / Model</th>
              <th>Location</th>
              <th>Status</th>
              <th>Condition</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            ${assets
              .map(
                (a) => `
              <tr>
                <td>${a.id}</td>
                <td>${a.name}</td>
                <td>${CATEGORY_LABELS[a.category]}</td>
                <td>${[a.brand, a.model].filter(Boolean).join(' ') || '-'}</td>
                <td>${a.location || '-'}</td>
                <td>${STATUS_LABELS[a.status]}</td>
                <td>${CONDITION_LABELS[a.condition]}</td>
                <td>${formatCurrency(a.purchasePrice, a.currency)}</td>
              </tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
  }, []);

  return { exportCSV, printAssets };
}

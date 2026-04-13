import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Camera, Package } from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import type { Asset, AssetCategory, AssetCondition, AssetStatus } from '../types';
import { categories } from '../data/categories';
import CameraCapture from '../components/CameraCapture';
import PhotoGallery from '../components/PhotoGallery';

export default function EditAsset() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAsset, updateAsset, addPhoto, removePhoto, setPrimaryPhoto, settings } = useAssets();
  const asset = getAsset(id!);

  const [form, setForm] = useState<Partial<Asset>>(asset ? { ...asset } : {});
  const [showCamera, setShowCamera] = useState(false);

  if (!asset) {
    return (
      <div className="text-center py-16">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-700">Asset not found</h2>
        <Link to="/assets" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
          Back to Assets
        </Link>
      </div>
    );
  }

  const set = <K extends keyof Asset>(key: K, value: Asset[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const catDef = categories.find((c) => c.id === form.category);

  const handleSave = () => {
    updateAsset(asset.id, {
      name: form.name?.trim(),
      category: form.category,
      subcategory: form.subcategory,
      brand: form.brand,
      model: form.model,
      serialNumber: form.serialNumber,
      location: form.location,
      department: form.department,
      status: form.status,
      condition: form.condition,
      purchaseDate: form.purchaseDate,
      purchasePrice: form.purchasePrice,
      currency: form.currency,
      warrantyExpiry: form.warrantyExpiry,
      assignedTo: form.assignedTo,
      notes: form.notes,
    });
    navigate(`/assets/${asset.id}`);
  };

  const handlePhotoCapture = (dataUrl: string) => {
    addPhoto(asset.id, {
      dataUrl,
      caption: '',
      capturedAt: new Date().toISOString(),
      isPrimary: asset.photos.length === 0,
    });
    setShowCamera(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Asset</h1>
          <p className="text-sm font-mono text-gray-400">{asset.id}</p>
        </div>
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Photos</h3>
        <PhotoGallery
          photos={asset.photos}
          onSetPrimary={(photoId) => setPrimaryPhoto(asset.id, photoId)}
          onRemove={(photoId) => removePhoto(asset.id, photoId)}
        />
        {showCamera ? (
          <CameraCapture onCapture={handlePhotoCapture} onClose={() => setShowCamera(false)} />
        ) : (
          <button
            onClick={() => setShowCamera(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:text-primary-600 w-full justify-center"
          >
            <Camera className="w-4 h-4" />
            Add Photo
          </button>
        )}
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={(e) => set('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category || ''}
              onChange={(e) => {
                set('category', e.target.value as AssetCategory);
                set('subcategory', '');
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
            <select
              value={form.subcategory || ''}
              onChange={(e) => set('subcategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Select</option>
              {catDef?.subcategories.map((s) => (
                <option key={s.subcategory} value={s.subcategory}>{s.subcategory}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input type="text" value={form.brand || ''} onChange={(e) => set('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <input type="text" value={form.model || ''} onChange={(e) => set('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
            <input type="text" value={form.serialNumber || ''} onChange={(e) => set('serialNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select value={form.condition || 'good'} onChange={(e) => set('condition', e.target.value as AssetCondition)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status || 'active'} onChange={(e) => set('status', e.target.value as AssetStatus)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="active">Active</option>
              <option value="in-repair">In Repair</option>
              <option value="retired">Retired</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={form.department || ''} onChange={(e) => set('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Select</option>
              {settings.departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select value={form.location || ''} onChange={(e) => set('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <option value="">Select</option>
              {settings.locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
            <input type="date" value={form.purchaseDate || ''} onChange={(e) => set('purchaseDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
            <input type="number" value={form.purchasePrice || ''} onChange={(e) => set('purchasePrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
            <input type="date" value={form.warrantyExpiry || ''} onChange={(e) => set('warrantyExpiry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <input type="text" value={form.assignedTo || ''} onChange={(e) => set('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!form.name?.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}

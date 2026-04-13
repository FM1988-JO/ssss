import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, ChevronLeft, X, Check, Sparkles, Loader2 } from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import type { AssetCategory, AssetCondition, AssetStatus, AssetPhoto } from '../types';
import { CATEGORY_LABELS } from '../types';
import { categories, getSubcategoryTemplate } from '../data/categories';
import CameraCapture from '../components/CameraCapture';
import { generateId } from '../utils/formatters';
import { analyzeAssetPhoto } from '../utils/ai';

type Step = 'photo' | 'category' | 'details' | 'review';

const emptyForm = {
  name: '',
  category: '' as AssetCategory | '',
  subcategory: '',
  brand: '',
  model: '',
  serialNumber: '',
  location: '',
  department: '',
  status: 'active' as AssetStatus,
  condition: 'new' as AssetCondition,
  purchaseDate: '',
  purchasePrice: 0,
  currency: 'SAR',
  warrantyExpiry: '',
  assignedTo: '',
  notes: '',
};

export default function AddAsset() {
  const navigate = useNavigate();
  const { addAsset, settings } = useAssets();
  const [step, setStep] = useState<Step>('photo');
  const [photos, setPhotos] = useState<AssetPhoto[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDone, setAiDone] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handlePhotoCapture = (dataUrl: string) => {
    const photo: AssetPhoto = {
      id: generateId(),
      dataUrl,
      caption: '',
      capturedAt: new Date().toISOString(),
      isPrimary: photos.length === 0,
    };
    setPhotos((prev) => [...prev, photo]);
    setShowCamera(false);
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (next.length > 0 && !next.some((p) => p.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  const handleAnalyze = async () => {
    if (!settings.aiApiKey) {
      setAiError('No API key. Go to Settings to add your free AI key.');
      return;
    }
    const photo = photos[0];
    if (!photo) return;

    setAnalyzing(true);
    setAiError(null);
    try {
      const result = await analyzeAssetPhoto(photo.dataUrl, settings.aiApiKey, settings.aiProvider);
      setForm((f) => ({
        ...f,
        name: result.name || f.name,
        category: result.category || f.category,
        subcategory: result.subcategory || f.subcategory,
        brand: result.brand || f.brand,
        model: result.model || f.model,
        condition: result.condition || f.condition,
        notes: result.notes || f.notes,
      }));
      setAiDone(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCategorySelect = (catId: AssetCategory) => {
    set('category', catId);
    set('subcategory', '');
    set('brand', '');
  };

  const handleSubcategorySelect = (sub: string) => {
    set('subcategory', sub);
    const tpl = getSubcategoryTemplate(form.category, sub);
    if (tpl?.defaultFields.condition) {
      set('condition', tpl.defaultFields.condition);
    }
  };

  const catDef = categories.find((c) => c.id === form.category);
  const subTpl = catDef
    ? getSubcategoryTemplate(form.category, form.subcategory)
    : undefined;

  const canProceed = () => {
    switch (step) {
      case 'photo': return true; // photos are optional
      case 'category': return form.category && form.subcategory;
      case 'details': return form.name.trim();
      case 'review': return true;
    }
  };

  const steps: Step[] = ['photo', 'category', 'details', 'review'];
  const stepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStep(steps[stepIndex - 1]);
    }
  };

  const handleSubmit = () => {
    const asset = addAsset({
      name: form.name.trim(),
      category: form.category as AssetCategory,
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
      currency: form.currency || settings.defaultCurrency,
      warrantyExpiry: form.warrantyExpiry,
      assignedTo: form.assignedTo,
      notes: form.notes,
      photos,
    });
    navigate(`/assets/${asset.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Asset</h1>
        <div className="flex items-center gap-2 mt-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < stepIndex
                    ? 'bg-primary-600 text-white'
                    : i === stepIndex
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < stepIndex ? 'bg-primary-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
          <span className="text-sm text-gray-500 ml-2 capitalize">{step}</span>
        </div>
      </div>

      {/* Step: Photo */}
      {step === 'photo' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Capture Photo (Optional)</h2>
          {showCamera ? (
            <CameraCapture
              onCapture={handlePhotoCapture}
              onClose={() => setShowCamera(false)}
            />
          ) : (
            <>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((p) => (
                    <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhoto(p.id)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowCamera(true)}
                className="w-full flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
              >
                <Camera className="w-5 h-5" />
                {photos.length > 0 ? 'Add Another Photo' : 'Take a Photo'}
              </button>

              {/* AI Analysis */}
              {photos.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-70 transition-all font-medium"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing photo...
                      </>
                    ) : aiDone ? (
                      <>
                        <Check className="w-5 h-5" />
                        Analyzed! Details auto-filled
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                  {aiError && (
                    <p className="text-sm text-danger-500 text-center">{aiError}</p>
                  )}
                  {aiDone && (
                    <p className="text-xs text-gray-500 text-center">
                      AI detected: {form.name || 'Unknown'} ({form.brand} {form.model}). You can edit details in the next steps.
                    </p>
                  )}
                  {!settings.aiApiKey && !aiError && (
                    <p className="text-xs text-gray-400 text-center">
                      Add your free AI key in{' '}
                      <a href="#/settings" className="text-primary-600 hover:underline">Settings</a>
                      {' '}to enable AI analysis.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Step: Category */}
      {step === 'category' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Select Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`p-4 rounded-xl border-2 text-center transition-colors ${
                  form.category === cat.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-sm">{cat.label}</p>
              </button>
            ))}
          </div>

          {form.category && catDef && (
            <>
              <h3 className="text-md font-medium text-gray-700 mt-6">Subcategory</h3>
              <div className="grid grid-cols-2 gap-2">
                {catDef.subcategories.map((sub) => (
                  <button
                    key={sub.subcategory}
                    onClick={() => handleSubcategorySelect(sub.subcategory)}
                    className={`px-4 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                      form.subcategory === sub.subcategory
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {sub.subcategory}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Asset Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={`e.g., ${form.subcategory || 'Office Laptop'}`}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => set('brand', e.target.value)}
                list="brand-suggestions"
                placeholder="Brand name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {subTpl && subTpl.commonBrands.length > 0 && (
                <datalist id="brand-suggestions">
                  {subTpl.commonBrands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
                placeholder="Model number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => set('serialNumber', e.target.value)}
                placeholder="Manufacturer serial"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => set('condition', e.target.value as AssetCondition)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as AssetStatus)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="in-repair">In Repair</option>
                <option value="retired">Retired</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => set('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select department</option>
                {settings.departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select location</option>
                {settings.locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Purchase Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => set('purchaseDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
              <div className="flex">
                <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-500">
                  {form.currency || settings.defaultCurrency}
                </span>
                <input
                  type="number"
                  value={form.purchasePrice || ''}
                  onChange={(e) => set('purchasePrice', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-r-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Warranty Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
              <input
                type="date"
                value={form.warrantyExpiry}
                onChange={(e) => set('warrantyExpiry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <input
                type="text"
                value={form.assignedTo}
                onChange={(e) => set('assignedTo', e.target.value)}
                placeholder="Employee name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Review & Submit</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {photos.length > 0 && (
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-2">Photos ({photos.length})</p>
                <div className="flex gap-2 overflow-x-auto">
                  {photos.map((p) => (
                    <img
                      key={p.id}
                      src={p.dataUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{form.name}</span></div>
              <div><span className="text-gray-500">Category:</span> <span className="font-medium">{form.category ? CATEGORY_LABELS[form.category as AssetCategory] : ''}</span></div>
              <div><span className="text-gray-500">Subcategory:</span> <span className="font-medium">{form.subcategory}</span></div>
              <div><span className="text-gray-500">Brand:</span> <span className="font-medium">{form.brand || '-'}</span></div>
              <div><span className="text-gray-500">Model:</span> <span className="font-medium">{form.model || '-'}</span></div>
              <div><span className="text-gray-500">Condition:</span> <span className="font-medium capitalize">{form.condition}</span></div>
              <div><span className="text-gray-500">Department:</span> <span className="font-medium">{form.department || '-'}</span></div>
              <div><span className="text-gray-500">Location:</span> <span className="font-medium">{form.location || '-'}</span></div>
              <div><span className="text-gray-500">Assigned To:</span> <span className="font-medium">{form.assignedTo || '-'}</span></div>
              {form.purchasePrice > 0 && (
                <div><span className="text-gray-500">Price:</span> <span className="font-medium">{form.purchasePrice} {form.currency}</span></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {stepIndex > 0 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step === 'review' ? (
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Save Asset
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

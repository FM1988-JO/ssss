import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Building,
  User,
  Calendar,
  DollarSign,
  Shield,
  Tag,
  Package,
} from 'lucide-react';
import { useAssets } from '../context/AssetContext';
import { CATEGORY_LABELS } from '../types';
import { StatusBadge, ConditionBadge } from '../components/StatusBadge';
import PhotoGallery from '../components/PhotoGallery';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ConfirmDialog from '../components/ConfirmDialog';
import { formatDate, formatCurrency, isWarrantyExpired } from '../utils/formatters';

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAsset, deleteAsset, setPrimaryPhoto, removePhoto } = useAssets();
  const [showDelete, setShowDelete] = useState(false);

  const asset = getAsset(id!);

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

  const handleDelete = () => {
    deleteAsset(asset.id);
    navigate('/assets');
  };

  const warrantyExpired = isWarrantyExpired(asset.warrantyExpiry);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-mono text-gray-400">{asset.id}</p>
            <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={asset.status} />
              <ConditionBadge condition={asset.condition} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/assets/${asset.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger-500 border border-gray-200 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {asset.photos.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Photos</h3>
              <PhotoGallery
                photos={asset.photos}
                onSetPrimary={(photoId) => setPrimaryPhoto(asset.id, photoId)}
                onRemove={(photoId) => removePhoto(asset.id, photoId)}
              />
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Asset Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={<Tag className="w-4 h-4" />} label="Category" value={`${CATEGORY_LABELS[asset.category]} - ${asset.subcategory}`} />
              <InfoRow icon={<Package className="w-4 h-4" />} label="Brand / Model" value={[asset.brand, asset.model].filter(Boolean).join(' ') || '-'} />
              <InfoRow icon={<Tag className="w-4 h-4" />} label="Serial Number" value={asset.serialNumber || '-'} />
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={asset.location || '-'} />
              <InfoRow icon={<Building className="w-4 h-4" />} label="Department" value={asset.department || '-'} />
              <InfoRow icon={<User className="w-4 h-4" />} label="Assigned To" value={asset.assignedTo || '-'} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Purchase Date" value={formatDate(asset.purchaseDate)} />
              <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Purchase Price" value={formatCurrency(asset.purchasePrice, asset.currency)} />
              <InfoRow
                icon={<Shield className="w-4 h-4" />}
                label="Warranty Expiry"
                value={formatDate(asset.warrantyExpiry)}
                highlight={warrantyExpired ? 'text-danger-500' : undefined}
              />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Added" value={formatDate(asset.createdAt)} />
            </div>
            {asset.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{asset.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QRCodeDisplay assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset.name}" (${asset.id})? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium ${highlight || 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  );
}

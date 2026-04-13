import { Link } from 'react-router-dom';
import { Package, MapPin } from 'lucide-react';
import type { Asset } from '../types';
import { CATEGORY_LABELS } from '../types';
import { StatusBadge, ConditionBadge } from './StatusBadge';

interface Props {
  asset: Asset;
}

export default function AssetCard({ asset }: Props) {
  const primaryPhoto = asset.photos.find((p) => p.isPrimary) || asset.photos[0];

  return (
    <Link
      to={`/assets/${asset.id}`}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all group"
    >
      {/* Photo */}
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.dataUrl}
            alt={asset.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StatusBadge status={asset.status} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs font-mono text-gray-400 mb-1">{asset.id}</p>
        <h3 className="font-semibold text-gray-900 truncate">{asset.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {CATEGORY_LABELS[asset.category]}
          {asset.subcategory ? ` - ${asset.subcategory}` : ''}
        </p>
        <div className="flex items-center justify-between mt-3">
          <ConditionBadge condition={asset.condition} />
          {asset.location && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              {asset.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

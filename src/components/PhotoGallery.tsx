import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Star, Trash2 } from 'lucide-react';
import type { AssetPhoto } from '../types';

interface Props {
  photos: AssetPhoto[];
  onSetPrimary?: (photoId: string) => void;
  onRemove?: (photoId: string) => void;
}

export default function PhotoGallery({ photos, onSetPrimary, onRemove }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? photos.length - 1 : lightboxIndex - 1);
    }
  };

  const goNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === photos.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, idx) => (
          <div key={photo.id} className="relative group">
            <button
              onClick={() => openLightbox(idx)}
              className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-transparent hover:border-primary-300 transition-colors"
            >
              <img src={photo.dataUrl} alt={photo.caption || `Photo ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
            {photo.isPrimary && (
              <div className="absolute top-1 left-1 bg-yellow-400 text-white rounded-full p-0.5">
                <Star className="w-3 h-3" />
              </div>
            )}
            {(onSetPrimary || onRemove) && (
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onSetPrimary && !photo.isPrimary && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetPrimary(photo.id); }}
                    className="p-1 bg-white/90 rounded-full shadow text-gray-600 hover:text-yellow-500"
                    title="Set as primary"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                {onRemove && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(photo.id); }}
                    className="p-1 bg-white/90 rounded-full shadow text-gray-600 hover:text-red-500"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button onClick={goPrev} className="absolute left-4 p-2 text-white/80 hover:text-white">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={goNext} className="absolute right-4 p-2 text-white/80 hover:text-white">
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
          <img
            src={photos[lightboxIndex].dataUrl}
            alt={photos[lightboxIndex].caption || ''}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-4 text-center text-white/70 text-sm">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}

import { useRef } from 'react';
import { Camera, Upload, ImagePlus } from 'lucide-react';
import { compressImage } from '../utils/storage';

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose?: () => void;
}

export default function CameraCapture({ onCapture }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      onCapture(compressed);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <ImagePlus className="w-12 h-12 text-gray-300" />
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Native camera - works on all mobile devices */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Camera className="w-5 h-5" />
          Take Photo
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Choose from Gallery
        </button>
      </div>
      <p className="text-xs text-gray-400">Take a photo or choose an image of the asset</p>

      {/* Camera input - opens native camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      {/* Gallery input - opens file picker / gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

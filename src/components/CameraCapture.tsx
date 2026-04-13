import { useRef } from 'react';
import { Camera, SwitchCamera, Upload, X } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { compressImage } from '../utils/storage';

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose?: () => void;
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const { videoRef, canvasRef, isStreaming, error, startCamera, stopCamera, capturePhoto, switchCamera } = useCamera();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    const dataUrl = capturePhoto();
    if (dataUrl) {
      stopCamera();
      onCapture(dataUrl);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {!isStreaming ? (
        <div className="flex flex-col items-center gap-4 p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          {error && <p className="text-sm text-danger-500 text-center">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={() => startCamera()}
              className="flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Camera className="w-5 h-5" />
              Open Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload File
            </button>
          </div>
          <p className="text-xs text-gray-400">Take a photo or upload an image of the asset</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-h-[60vh] object-contain" />
          <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center gap-4 bg-gradient-to-t from-black/60">
            {onClose && (
              <button onClick={() => { stopCamera(); onClose(); }} className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30">
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleCapture}
              className="w-16 h-16 rounded-full bg-white border-4 border-white/50 hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-gray-100" />
            </button>
            <button onClick={switchCamera} className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30">
              <SwitchCamera className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

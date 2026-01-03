import React from 'react';
import { AspectRatio, ImageSize } from '../types';
import { X, Sparkles } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  imageSize: ImageSize;
  setImageSize: (size: ImageSize) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  aspectRatio,
  setAspectRatio,
  imageSize,
  setImageSize,
}) => {
  if (!isOpen) return null;

  const ratios: AspectRatio[] = ['9:16', '16:9', '1:1', '4:3', '3:4'];
  const sizes: ImageSize[] = ['1K', '2K', '4K'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-gray-900 border-t border-gray-800 rounded-t-3xl p-6 shadow-2xl transform transition-transform duration-300 translate-y-0 pb-[max(2rem,env(safe-area-inset-bottom))]">
        
        {/* Drag handle */}
        <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-6" />

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-300" />
          </button>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-3">
              {ratios.map((r) => (
                <button
                  key={r}
                  onClick={() => setAspectRatio(r)}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    aspectRatio === r
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-[1.02]'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-750 active:scale-95'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">Resolution (Quality)</label>
            <div className="grid grid-cols-3 gap-3">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setImageSize(s)}
                  className={`py-3 px-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    imageSize === s
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-750 active:scale-95'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-10 flex items-center justify-center gap-2 opacity-60">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Powered by Gemini</span>
            <Sparkles size={12} className="text-purple-400" />
        </div>

      </div>
    </div>
  );
};
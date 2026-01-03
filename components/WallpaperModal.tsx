import React from 'react';
import { Wallpaper } from '../types';
import { Download, Sparkles, X, RefreshCw } from 'lucide-react';

interface WallpaperModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
  isRemixing: boolean;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({ wallpaper, onClose, onRemix, isRemixing }) => {
  if (!wallpaper) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = wallpaper.url;
    link.download = `vibewall-${wallpaper.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 p-4">
      
      {/* Close Button - Larger touch target */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 z-10 p-4 bg-black/40 rounded-full text-white/80 hover:text-white hover:bg-black/60 backdrop-blur-md transition-all active:scale-90"
      >
        <X size={24} />
      </button>

      <div className="relative w-full h-full flex flex-col items-center justify-center pb-[env(safe-area-inset-bottom)]">
        {/* Image Container - constrained height for mobile */}
        <div className="relative w-full flex-1 min-h-0 flex items-center justify-center mb-20 md:mb-24">
            <img 
            src={wallpaper.url} 
            alt={wallpaper.prompt} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
        </div>

        {/* Actions Bar - Fixed at bottom */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 px-6 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-800 text-white rounded-2xl font-semibold shadow-lg hover:bg-gray-700 active:scale-95 transition-all w-full md:w-auto"
          >
            <Download size={20} />
            <span>Save</span>
          </button>
          
          <button
            onClick={() => onRemix(wallpaper)}
            disabled={isRemixing}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold shadow-lg shadow-purple-900/30 transition-all active:scale-95 w-full md:w-auto ${
              isRemixing 
                ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:brightness-110'
            }`}
          >
            {isRemixing ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
            <span>{isRemixing ? 'Remixing...' : 'Remix'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
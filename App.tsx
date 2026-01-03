import React, { useState, useRef, useEffect } from 'react';
import { generateWallpapers, remixWallpaper } from './services/geminiService';
import { Wallpaper, AspectRatio, ImageSize } from './types';
import { SettingsPanel } from './components/SettingsPanel';
import { WallpaperModal } from './components/WallpaperModal';
import { Settings2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);

  // Scroll ref
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setLoadingMessage('Dreaming up your vibe...');
    scrollToBottom();

    // Blur input on mobile to hide keyboard
    if (window.innerWidth < 768) {
      (document.activeElement as HTMLElement)?.blur();
    }

    try {
      const images = await generateWallpapers(prompt, aspectRatio, imageSize);
      
      const newWallpapers: Wallpaper[] = images.map(url => ({
        id: crypto.randomUUID(),
        url,
        prompt,
        createdAt: Date.now(),
        aspectRatio
      }));

      setWallpapers(prev => [...prev, ...newWallpapers]);
      
      if (newWallpapers.length === 0) {
        alert('Could not generate images. Please check your API key and try again.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to generate wallpapers. See console for details.');
    } finally {
      setIsGenerating(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleRemix = async (baseWallpaper: Wallpaper) => {
    setIsGenerating(true);
    setLoadingMessage('Remixing your vibe...');
    // Close modal to show progress in grid (optional, but good for context)
    setSelectedWallpaper(null);
    scrollToBottom();

    try {
      // Use original prompt for remix context, or could ask user for modification
      const images = await remixWallpaper(baseWallpaper.url, baseWallpaper.prompt, aspectRatio, imageSize);
      
      const newWallpapers: Wallpaper[] = images.map(url => ({
        id: crypto.randomUUID(),
        url,
        prompt: `Remix: ${baseWallpaper.prompt}`,
        createdAt: Date.now(),
        aspectRatio
      }));

      setWallpapers(prev => [...prev, ...newWallpapers]);
    } catch (error) {
      console.error(error);
      alert('Failed to remix wallpaper.');
    } finally {
      setIsGenerating(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // Determine grid columns based on aspect ratio roughly
  const getGridClass = () => {
    // Standard Masonry-ish feel
    return "grid grid-cols-2 gap-3 p-3 pb-32";
  };

  return (
    <div className="h-[100dvh] bg-gray-950 flex flex-col font-sans text-gray-100 overflow-hidden">
      
      {/* Header */}
      <header className="flex-none bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-4 py-3 flex items-center justify-between z-30 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            VibeWall
          </h1>
        </div>
        <div className="text-[10px] font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded border border-gray-800">
          {aspectRatio} • {imageSize}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative w-full max-w-3xl mx-auto touch-pan-y">
        {wallpapers.length === 0 && !isGenerating ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6 py-12">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-900/20 animate-in zoom-in duration-300">
              <ImageIcon size={32} className="text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Create your vibe</h2>
            <p className="text-gray-400 max-w-xs text-sm leading-relaxed">
              Describe a scene, a feeling, or a style. We'll generate 4 unique wallpapers for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {["Rainy cyberpunk", "Pastel sunset clouds", "Minimalist topographic", "Neon noir city"].map(ex => (
                <button 
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-full text-xs text-gray-300 transition-colors border border-gray-700"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={getGridClass()}>
            {wallpapers.map((wp) => (
              <div 
                key={wp.id} 
                className="relative group rounded-xl overflow-hidden cursor-pointer shadow-lg shadow-black/50 transition-all active:scale-95 bg-gray-900"
                style={{ aspectRatio: wp.aspectRatio.replace(':', '/') }}
                onClick={() => setSelectedWallpaper(wp)}
              >
                <img 
                  src={wp.url} 
                  alt={wp.prompt} 
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
            
            {/* Loading Skeletons */}
            {isGenerating && (
              <>
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={`loading-${i}`} 
                    className="relative rounded-xl overflow-hidden bg-gray-900 animate-pulse flex items-center justify-center border border-gray-800"
                    style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                  >
                    <Loader2 className="text-gray-700 animate-spin" size={24} />
                  </div>
                ))}
              </>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="flex-none z-40 bg-gray-950/90 backdrop-blur-xl border-t border-gray-800 w-full pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 px-3">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {isGenerating && (
             <div className="text-center text-xs font-medium text-purple-400 animate-pulse">
               {loadingMessage}
             </div>
          )}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors flex-shrink-0 active:scale-95"
              aria-label="Settings"
            >
              <Settings2 size={22} />
            </button>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vibe..."
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
              className="flex-1 bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 placeholder-gray-500 text-base" 
            />
            {/* Note: text-base prevents auto-zoom on iOS inputs */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`p-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 flex-shrink-0 ${
                isGenerating || !prompt.trim()
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-900/30 hover:brightness-110 active:scale-95'
              }`}
            >
              {isGenerating ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Overlays */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        imageSize={imageSize}
        setImageSize={setImageSize}
      />

      <WallpaperModal
        wallpaper={selectedWallpaper}
        onClose={() => setSelectedWallpaper(null)}
        onRemix={handleRemix}
        isRemixing={isGenerating}
      />
    </div>
  );
}
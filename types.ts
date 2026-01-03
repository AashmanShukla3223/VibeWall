export interface Wallpaper {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  createdAt: number;
  aspectRatio: string;
}

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
export type ImageSize = '1K' | '2K' | '4K';

export interface GenerationConfig {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}

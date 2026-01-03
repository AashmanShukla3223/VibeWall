import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageSize } from "../types";

// Helper to ensure we have a valid API key from the special selection flow
async function ensureApiKey(): Promise<string> {
  // @ts-ignore - window.aistudio is injected by the environment
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
       // @ts-ignore
       await window.aistudio.openSelectKey();
    }
  }
  // The environment variable is automatically populated after selection
  return process.env.API_KEY || '';
}

export async function generateWallpapers(
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize,
  count: number = 4
): Promise<string[]> {
  await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Gemini 3 Pro Image Preview typically generates one image per request in this context.
  // To get 4 variations, we run parallel requests.
  const promises = Array.from({ length: count }).map(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error generating single image variation:", error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
}

export async function remixWallpaper(
  base64Image: string,
  prompt: string,
  aspectRatio: AspectRatio,
  imageSize: ImageSize,
  count: number = 4
): Promise<string[]> {
  await ensureApiKey();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Remove data URI prefix for the API call
  const cleanBase64 = base64Image.split(',')[1];
  const mimeType = base64Image.substring(base64Image.indexOf(':') + 1, base64Image.indexOf(';'));

  const promises = Array.from({ length: count }).map(async () => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            { text: prompt || "Generate a variation of this image." },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize,
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error remixing image:", error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is string => res !== null);
}

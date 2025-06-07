// utils/imageUtils.ts
export const generateThumbnail = async (
  imageBase64: string,
  maxWidth: number = 120,
  maxHeight: number = 120,
  quality: number = 0.6 
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Transparent 1x1 pixel GIF
    const FAILED_PLACEHOLDER = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    if (!imageBase64 || !imageBase64.startsWith("data:image")) {
      // console.warn("generateThumbnail: Invalid or placeholder imageBase64 received", imageBase64);
      resolve(FAILED_PLACEHOLDER);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width === 0 || height === 0) {
        // console.warn("generateThumbnail: Image has zero dimensions.");
        resolve(FAILED_PLACEHOLDER);
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      // Ensure dimensions are at least 1px
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // console.error('Could not get canvas context for thumbnail generation.');
        resolve(FAILED_PLACEHOLDER); // Resolve with placeholder to avoid unhandled promise rejection in caller
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (e) {
        // console.warn("Thumbnail generation: JPEG not supported or error, falling back to PNG.", e);
        try {
            const dataUrlPng = canvas.toDataURL('image/png');
            resolve(dataUrlPng);
        } catch (pngError) {
            // console.error("Thumbnail generation: PNG fallback also failed.", pngError);
            resolve(FAILED_PLACEHOLDER);
        }
      }
    };
    img.onerror = (errorEvent) => {
      // console.error("Error loading image for thumbnail generation:", errorEvent);
      resolve(FAILED_PLACEHOLDER);
    };
    
    img.src = imageBase64;
  });
};

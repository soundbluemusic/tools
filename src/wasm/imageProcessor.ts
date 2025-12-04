/**
 * Image Processor
 * Canvas-based image processing utilities
 * For more complex operations, can be extended with WASM libraries
 */

/**
 * Image processing options
 */
export interface ImageProcessOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

/**
 * Filter options for image effects
 */
export interface FilterOptions {
  brightness?: number; // 0-200, default 100
  contrast?: number; // 0-200, default 100
  saturation?: number; // 0-200, default 100
  blur?: number; // 0-100, default 0
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
}

/**
 * Create an offscreen canvas for image processing
 */
function createCanvas(
  width: number,
  height: number
): {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
} {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d')!;
    return { canvas, ctx };
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

/**
 * Load image from file or URL
 */
export async function loadImage(
  source: File | Blob | string
): Promise<ImageBitmap> {
  if (typeof source === 'string') {
    const response = await fetch(source);
    const blob = await response.blob();
    return createImageBitmap(blob);
  }
  return createImageBitmap(source);
}

/**
 * Resize image
 */
export async function resizeImage(
  source: File | Blob | ImageBitmap,
  options: ImageProcessOptions
): Promise<Blob> {
  const image =
    source instanceof ImageBitmap ? source : await loadImage(source);
  const {
    width,
    height,
    quality = 0.9,
    format = 'jpeg',
    maintainAspectRatio = true,
  } = options;

  let targetWidth = width || image.width;
  let targetHeight = height || image.height;

  if (maintainAspectRatio && width && height) {
    const aspectRatio = image.width / image.height;
    if (width / height > aspectRatio) {
      targetWidth = height * aspectRatio;
    } else {
      targetHeight = width / aspectRatio;
    }
  }

  const { canvas, ctx } = createCanvas(targetWidth, targetHeight);
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

  const mimeType = `image/${format}`;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  }

  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => resolve(blob!),
      mimeType,
      quality
    );
  });
}

/**
 * Crop image
 */
export async function cropImage(
  source: File | Blob | ImageBitmap,
  crop: { x: number; y: number; width: number; height: number },
  options: Omit<ImageProcessOptions, 'width' | 'height'> = {}
): Promise<Blob> {
  const image =
    source instanceof ImageBitmap ? source : await loadImage(source);
  const { quality = 0.9, format = 'jpeg' } = options;

  const { canvas, ctx } = createCanvas(crop.width, crop.height);
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height
  );

  const mimeType = `image/${format}`;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  }

  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => resolve(blob!),
      mimeType,
      quality
    );
  });
}

/**
 * Apply CSS filters to image
 */
export async function applyFilters(
  source: File | Blob | ImageBitmap,
  filters: FilterOptions,
  options: Omit<ImageProcessOptions, 'width' | 'height'> = {}
): Promise<Blob> {
  const image =
    source instanceof ImageBitmap ? source : await loadImage(source);
  const { quality = 0.9, format = 'jpeg' } = options;

  const { canvas, ctx } = createCanvas(image.width, image.height);

  // Build CSS filter string
  const filterParts: string[] = [];
  if (filters.brightness !== undefined) {
    filterParts.push(`brightness(${filters.brightness}%)`);
  }
  if (filters.contrast !== undefined) {
    filterParts.push(`contrast(${filters.contrast}%)`);
  }
  if (filters.saturation !== undefined) {
    filterParts.push(`saturate(${filters.saturation}%)`);
  }
  if (filters.blur !== undefined && filters.blur > 0) {
    filterParts.push(`blur(${filters.blur}px)`);
  }
  if (filters.grayscale) {
    filterParts.push('grayscale(100%)');
  }
  if (filters.sepia) {
    filterParts.push('sepia(100%)');
  }
  if (filters.invert) {
    filterParts.push('invert(100%)');
  }

  ctx.filter = filterParts.join(' ') || 'none';
  ctx.drawImage(image, 0, 0);

  const mimeType = `image/${format}`;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  }

  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => resolve(blob!),
      mimeType,
      quality
    );
  });
}

/**
 * Rotate image by degrees
 */
export async function rotateImage(
  source: File | Blob | ImageBitmap,
  degrees: number,
  options: Omit<ImageProcessOptions, 'width' | 'height'> = {}
): Promise<Blob> {
  const image =
    source instanceof ImageBitmap ? source : await loadImage(source);
  const { quality = 0.9, format = 'jpeg' } = options;

  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const newWidth = image.width * cos + image.height * sin;
  const newHeight = image.width * sin + image.height * cos;

  const { canvas, ctx } = createCanvas(newWidth, newHeight);

  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  const mimeType = `image/${format}`;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  }

  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => resolve(blob!),
      mimeType,
      quality
    );
  });
}

/**
 * Flip image horizontally or vertically
 */
export async function flipImage(
  source: File | Blob | ImageBitmap,
  direction: 'horizontal' | 'vertical',
  options: Omit<ImageProcessOptions, 'width' | 'height'> = {}
): Promise<Blob> {
  const image =
    source instanceof ImageBitmap ? source : await loadImage(source);
  const { quality = 0.9, format = 'jpeg' } = options;

  const { canvas, ctx } = createCanvas(image.width, image.height);

  if (direction === 'horizontal') {
    ctx.translate(image.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, image.height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(image, 0, 0);

  const mimeType = `image/${format}`;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  }

  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => resolve(blob!),
      mimeType,
      quality
    );
  });
}

/**
 * Convert image format
 */
export async function convertImage(
  source: File | Blob | ImageBitmap,
  format: 'jpeg' | 'png' | 'webp',
  quality = 0.9
): Promise<Blob> {
  const image =
    source instanceof ImageBitmap ? source : await loadImage(source);
  const { canvas, ctx } = createCanvas(image.width, image.height);

  ctx.drawImage(image, 0, 0);

  const mimeType = `image/${format}`;

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  }

  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => resolve(blob!),
      mimeType,
      quality
    );
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  source: File | Blob
): Promise<{ width: number; height: number }> {
  const image = await loadImage(source);
  return { width: image.width, height: image.height };
}

/**
 * Create thumbnail
 */
export async function createThumbnail(
  source: File | Blob,
  maxSize: number,
  options: Omit<ImageProcessOptions, 'width' | 'height'> = {}
): Promise<Blob> {
  const image = await loadImage(source);
  const aspectRatio = image.width / image.height;

  let width: number;
  let height: number;

  if (aspectRatio > 1) {
    width = maxSize;
    height = maxSize / aspectRatio;
  } else {
    height = maxSize;
    width = maxSize * aspectRatio;
  }

  return resizeImage(image, {
    ...options,
    width,
    height,
    maintainAspectRatio: false,
  });
}

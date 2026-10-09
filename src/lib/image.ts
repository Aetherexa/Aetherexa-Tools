export type FitMode = 'contain' | 'cover';
export interface ImageOptions { width: number; height: number; maxKB: number; fit: FitMode; }
export interface CompressedImage { blob: Blob; width: number; height: number; metTarget: boolean; }

export function validateImageOptions(file: Pick<File, 'type' | 'size'>, opts: ImageOptions): void {
  // SVG animation, external references and unsupported formats must not enter the image pipeline.
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'].includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP, GIF or BMP image. SVG is not supported.');
  }
  if (file.size <= 0 || file.size > 15 * 1024 * 1024) throw new Error('Image must be between 1 byte and 15 MB.');
  if (!Number.isInteger(opts.width) || !Number.isInteger(opts.height) || opts.width < 1 || opts.height < 1 || opts.width > 4000 || opts.height > 4000) {
    throw new Error('Dimensions must be between 1 and 4000 pixels.');
  }
  if (opts.width * opts.height > 12_000_000) throw new Error('Output image exceeds the 12 megapixel limit.');
  if (!Number.isFinite(opts.maxKB) || opts.maxKB < 1 || opts.maxKB > 10000) throw new Error('Target size must be between 1 and 10,000 KB.');
  if (opts.fit !== 'contain' && opts.fit !== 'cover') throw new Error('Invalid image fit mode.');
}

export async function compressImage(file: File, opts: ImageOptions): Promise<CompressedImage> {
  validateImageOptions(file, opts);
  const { width, height, maxKB, fit } = opts;
  const sourceUrl = URL.createObjectURL(file);
  const img = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Unable to read this image.'));
      img.src = sourceUrl;
    });
    if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 40_000_000) {
      throw new Error('Image dimensions are invalid or exceed the 40 megapixel input limit.');
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas image processing is unavailable.');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);
    const ratio = fit === 'cover'
      ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
      : Math.min(width / img.naturalWidth, height / img.naturalHeight);
    const scaledWidth = img.naturalWidth * ratio;
    const scaledHeight = img.naturalHeight * ratio;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(img, (width - scaledWidth) / 2, (height - scaledHeight) / 2, scaledWidth, scaledHeight);
    const encode = async (quality: number): Promise<Blob> => {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (!blob) throw new Error('Unable to encode a JPEG image.');
      return blob;
    };
    const limit = Math.floor(maxKB * 1024);
    let low = 0.1;
    let high = 0.95;
    let best = await encode(low);
    if (best.size > limit) return { blob: best, width, height, metTarget: false };
    for (let iteration = 0; iteration < 10; iteration++) {
      const mid = (low + high) / 2;
      const candidate = await encode(mid);
      if (candidate.size <= limit) { low = mid; best = candidate; }
      else high = mid;
    }
    return { blob: best, width, height, metTarget: best.size <= limit };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

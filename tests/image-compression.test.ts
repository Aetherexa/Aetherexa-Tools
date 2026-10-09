import { afterEach, describe, expect, it, vi } from 'vitest';
import { compressImage } from '../src/lib/image';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
const opts = { width: 200, height: 230, maxKB: 50, fit: 'contain' as const };

function setCanvas(blobSize = 8_000, width = 800, height = 600) {
  const revoked = vi.fn();
  const createObjectURL = vi.fn(() => 'blob:test');
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: revoked });
  class MockImage {
    naturalWidth = width;
    naturalHeight = height;
    onload?: () => void;
    onerror?: () => void;
    set src(_value: string) { queueMicrotask(() => this.onload?.()); }
  }
  vi.stubGlobal('Image', MockImage);
  const drawImage = vi.fn();
  const context = { fillStyle: '', fillRect: vi.fn(), imageSmoothingEnabled: false, imageSmoothingQuality: 'low', drawImage };
  const canvas = { width: 0, height: 0, getContext: vi.fn(() => context), toBlob: vi.fn((callback: (blob: Blob) => void) => callback(new Blob([new Uint8Array(blobSize)]))) };
  vi.stubGlobal('document', { createElement: vi.fn(() => canvas) });
  return { revoked, drawImage, canvas };
}
const file = () => ({type:'image/png',size:1000} as File);

describe('browser image compression adapter', () => {
  it('resizes successfully and revokes its source URL', async () => {
    const { revoked, drawImage, canvas } = setCanvas();
    const result = await compressImage(file(), opts);
    expect(result.metTarget).toBe(true);
    expect(result.width).toBe(200);
    expect(canvas.width).toBe(200);
    expect(drawImage).toHaveBeenCalledOnce();
    expect(revoked).toHaveBeenCalledWith('blob:test');
  });
  it('does not falsely claim success if output exceeds limit', async () => {
    const { revoked } = setCanvas(30_000);
    const result = await compressImage(file(), {...opts,maxKB:10});
    expect(result.metTarget).toBe(false);
    expect(revoked).toHaveBeenCalledOnce();
  });
  it('rejects a decompression bomb by pixel count', async () => {
    const { revoked } = setCanvas(8_000, 8000, 8000);
    await expect(compressImage(file(), opts)).rejects.toThrow('40 megapixel');
    expect(revoked).toHaveBeenCalledOnce();
  });
  it('rejects invalid files before creating object URLs', async () => {
    const { revoked } = setCanvas();
    await expect(compressImage({...file(), type:'image/svg+xml'} as File, opts)).rejects.toThrow('SVG');
    expect(revoked).not.toHaveBeenCalled();
  });
});

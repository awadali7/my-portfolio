import { BLOG_IMAGE_MAX_BYTES } from '../helpers/blog';
import type { BlogImageUploadProps } from '../types/blog';

/** What the file picker offers. The backend checks the real bytes anyway. */
export const ACCEPTED_IMAGE_TYPES =
  'image/jpeg,image/png,image/gif,image/webp,image/avif';

const RESIZABLE = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 2000;
const SMALL_ENOUGH = 1.5 * 1024 * 1024;
const QUALITY = 0.85;

const toBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, QUALITY));

/**
 * Phone photos are often 5 to 10 MB. Big JPEG, PNG and WebP images are drawn
 * at most 2000 px on their long side and saved as WebP, or the original type
 * where the browser can't write WebP. GIFs, which may be animated, and images
 * that are already small are sent as they are. Browser only.
 */
export const prepareImage = async (file: File): Promise<Blob> => {
  if (!RESIZABLE.includes(file.type)) return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  if (scale === 1 && file.size <= SMALL_ENOUGH) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await toBlob(canvas, 'image/webp');
  if (webp && webp.type === 'image/webp') return webp;
  const fallback = await toBlob(
    canvas,
    file.type === 'image/png' ? 'image/png' : 'image/jpeg',
  );
  return fallback && fallback.size < file.size ? fallback : file;
};

const megabytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

/** Shrinks if needed, uploads through the console's API and returns the image's address. */
export const uploadImageFile = async (
  file: File,
): Promise<BlogImageUploadProps> => {
  const prepared = await prepareImage(file);
  if (prepared.size > BLOG_IMAGE_MAX_BYTES) {
    throw new Error(
      `That image is ${megabytes(prepared.size)} MB. Keep images under ${megabytes(BLOG_IMAGE_MAX_BYTES)} MB.`,
    );
  }

  const form = new FormData();
  form.append('file', prepared, file.name || 'image');

  const response = await fetch('/api/admin/blog/uploads', {
    method: 'POST',
    body: form,
  });
  if (response.status === 401) {
    window.location.assign('/admin/login');
    throw new Error('Your session expired. Sign in again.');
  }
  const body = (await response.json().catch(() => ({}))) as {
    message?: string;
  } & Partial<BlogImageUploadProps>;
  if (!response.ok || !body.url) {
    throw new Error(body.message || `Upload failed (${response.status})`);
  }
  return body as BlogImageUploadProps;
};

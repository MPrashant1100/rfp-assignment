/**
 * Force-download a Cloudinary asset by inserting the "fl_attachment" flag
 * into the delivery URL (works for raw/upload, image/upload, video/upload).
 * If it's not a Cloudinary /upload/ URL, returns the original URL unchanged.
 */
export const toCloudinaryDownloadUrl = (url: string): string => {
  if (!url) return url;
  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (idx === -1) return url; // non-cloudinary or not a delivery URL
  return url.slice(0, idx + marker.length) + 'fl_attachment/' + url.slice(idx + marker.length);
};

/**
 * Simple check to decide whether to show a "View PDF" link.
 * (Cloudinary handles PDFs fine, we keep the original URL for inline preview.)
 */
export const isPdfUrl = (url: string): boolean =>
  !!url && url.toLowerCase().includes('.pdf');

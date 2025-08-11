// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER_RFPS,
  CLOUDINARY_FOLDER_RESPONSES,
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error(
    'Cloudinary env vars are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export const cloudinaryFolders = {
  rfps: CLOUDINARY_FOLDER_RFPS || 'rfp-app/rfps',
  responses: CLOUDINARY_FOLDER_RESPONSES || 'rfp-app/responses',
};

/**
 * Upload a Buffer to Cloudinary using upload_stream and the exact bytes.
 * - resource_type: 'image' for images, otherwise 'raw' (PDF/DOC/etc.)
 * - public_id excludes extension to avoid .pdf.pdf
 */
export function uploadBufferToCloudinary(
  buffer: Buffer,
  filename: string,
  folder: string,
  mimetype?: string
): Promise<{ url: string; public_id: string }> {
  if (!buffer || buffer.length === 0) {
    return Promise.reject(new Error('Empty buffer: no data to upload'));
  }

  const { name } = path.parse(filename); // name without extension
  const safeBase = name.replace(/\s+/g, '_');
  const resourceType = mimetype?.startsWith('image/') ? 'image' : 'raw';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
        public_id: `${Date.now()}-${safeBase}`,
        unique_filename: false,
        overwrite: false,
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Cloudinary upload failed'));
        resolve({ url: result.secure_url as string, public_id: result.public_id as string });
      }
    );

    // Write the buffer directly to the stream (no base64)
    stream.end(buffer);
  });
}

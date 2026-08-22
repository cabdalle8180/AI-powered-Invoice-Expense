import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.cloudinary_cloud_name,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.cloudinary_api_key,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.cloudinary_api_secret,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
}

/**
 * Upload a buffer to Cloudinary.
 * @param buffer  - File buffer from multer memory storage
 * @param folder  - Cloudinary folder to store image in
 * @param public_id - Optional public_id (for replacement / deterministic naming)
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  public_id?: string
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const opts: Record<string, unknown> = {
      folder,
      resource_type: "auto",
      overwrite: true,
    };

    if (public_id) {
      opts.public_id = public_id;
    }

    const stream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error || !result) {
        reject(error || new Error("Cloudinary upload failed"));
        return;
      }
      resolve({
        url: result.secure_url,
        public_id: result.public_id,
      });
    });

    stream.end(buffer);
  });
};

/**
 * Delete an asset from Cloudinary by public_id.
 */
export const deleteFromCloudinary = async (public_id: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    // Non-fatal — log and continue
  }
};

export default cloudinary;

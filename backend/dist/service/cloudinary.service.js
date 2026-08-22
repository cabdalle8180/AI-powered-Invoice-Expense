"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.cloudinary_cloud_name,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.cloudinary_api_key,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.cloudinary_api_secret,
    secure: true,
});
/**
 * Upload a buffer to Cloudinary.
 * @param buffer  - File buffer from multer memory storage
 * @param folder  - Cloudinary folder to store image in
 * @param public_id - Optional public_id (for replacement / deterministic naming)
 */
const uploadToCloudinary = (buffer, folder, public_id) => {
    return new Promise((resolve, reject) => {
        const opts = {
            folder,
            resource_type: "auto",
            overwrite: true,
        };
        if (public_id) {
            opts.public_id = public_id;
        }
        const stream = cloudinary_1.v2.uploader.upload_stream(opts, (error, result) => {
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
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Delete an asset from Cloudinary by public_id.
 */
const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary_1.v2.uploader.destroy(public_id);
    }
    catch (err) {
        console.error("Cloudinary delete error:", err);
        // Non-fatal — log and continue
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;

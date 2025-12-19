import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

// MinIO Configuration
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  region: "us-east-1", // MinIO doesn't use regions, but SDK requires it
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // WAJIB untuk MinIO
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME; // Nama bucket untuk foto siswa

/**
 * Upload file ke MinIO
 * @param {Buffer} fileBuffer - Buffer file yang akan diupload
 * @param {string} originalName - Nama asli file
 * @param {string} mimeType - MIME type file (image/jpeg, image/png, etc)
 * @param {string} folder - Folder dalam bucket (optional)
 * @returns {Promise<{key: string, url: string}>}
 */
export const uploadFile = async (fileBuffer, originalName, mimeType, folder = "photos") => {
  try {
    // Generate unique filename
    const fileExtension = path.extname(originalName);
    const fileName = `${crypto.randomBytes(16).toString("hex")}${fileExtension}`;
    const key = folder ? `${folder}/${fileName}` : fileName;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      // ACL: "public-read", // Uncomment jika ingin file public
      // Add CORS headers for certificate backgrounds
      Metadata: {
        'Access-Control-Allow-Origin': '*',
      },
      CacheControl: 'public, max-age=31536000',
    });

    await s3Client.send(command);

    // Generate URL
    const url = `${process.env.MINIO_ENDPOINT}/${BUCKET_NAME}/${key}`;

    return {
      key,
      url,
      fileName,
    };
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete file dari MinIO
 * @param {string} key - Key file yang akan dihapus
 * @returns {Promise<void>}
 */
export const deleteFile = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    console.log(`File deleted: ${key}`);
  } catch (error) {
    console.error("MinIO delete error:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * Generate signed URL untuk akses private file
 * @param {string} key - Key file
 * @param {number} expiresIn - Waktu expired dalam detik (default 3600 = 1 jam)
 * @returns {Promise<string>}
 */
export const getSignedFileUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("MinIO signed URL error:", error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

/**
 * Extract key dari URL MinIO
 * @param {string} url - Full URL file di MinIO
 * @returns {string|null}
 */
export const extractKeyFromUrl = (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    // Format: https://objectstorage.simsmk.sch.id/edulite-students/photos/xxx.jpg
    const pathParts = urlObj.pathname.split("/");
    // Remove empty string and bucket name
    pathParts.shift(); // remove empty
    pathParts.shift(); // remove bucket name
    return pathParts.join("/"); // return photos/xxx.jpg
  } catch (error) {
    console.error("Failed to extract key from URL:", error);
    return null;
  }
};

export { s3Client, BUCKET_NAME };

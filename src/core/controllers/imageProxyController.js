import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "../../config/minio.js";

/**
 * Proxy image from MinIO with CORS headers
 * This solves CORS issues when loading images in browser
 */
export const proxyImage = async (req, res) => {
    try {
        // Get the key from the path (everything after /api/proxy/image/)
        // req.path will be like /certificate-backgrounds/2/filename.png
        const key = req.path.substring(1); // Remove leading slash

        if (!key) {
            return res.status(400).json({ message: "Image key is required" });
        }

        // Decode the key (in case it's URL encoded)
        const decodedKey = decodeURIComponent(key);

        console.log(`Proxying image: ${decodedKey}`);

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: decodedKey,
        });

        const response = await s3Client.send(command);

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        // Set content type from S3 response
        if (response.ContentType) {
            res.setHeader('Content-Type', response.ContentType);
        }

        // Stream the image
        response.Body.pipe(res);
    } catch (error) {
        console.error("Error proxying image:", error.message);

        // Return appropriate error based on error type
        if (error.name === 'NoSuchKey') {
            return res.status(404).json({ message: "Image not found" });
        }

        if (error.name === 'NetworkingError' || error.message.includes('ECONNREFUSED')) {
            return res.status(503).json({ message: "Storage service unavailable" });
        }

        res.status(500).json({ message: "Failed to load image" });
    }
};

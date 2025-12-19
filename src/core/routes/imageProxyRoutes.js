import express from "express";
import { proxyImage } from "../controllers/imageProxyController.js";

const router = express.Router();

// Proxy image from MinIO (no auth required for public images)
// Use middleware to handle all requests
router.use("/", proxyImage);

export default router;

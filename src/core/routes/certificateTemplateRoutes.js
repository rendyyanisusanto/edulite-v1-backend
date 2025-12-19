import { Router } from "express";
import certificateTemplateController from "../controllers/certificateTemplateController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/upload.js";

const router = Router();

// Get all certificate templates for user's school
router.get("/", verifyToken, certificateTemplateController.getAllTemplates);

// Get background image URL (must be before /:id)
router.get("/:id/background", verifyToken, certificateTemplateController.getBackgroundUrl);

// Preview certificate with sample data (must be before /:id)
router.get("/:id/preview", verifyToken, certificateTemplateController.previewCertificate);

// Get certificate template by ID
router.get("/:id", verifyToken, certificateTemplateController.getTemplateById);

// Create new certificate template (with optional background image)
router.post("/", verifyToken, upload.single("background"), certificateTemplateController.createTemplate);

// Update certificate template (with optional background image)
router.put("/:id", verifyToken, upload.single("background"), certificateTemplateController.updateTemplate);

// Upload/update background image
router.post("/:id/upload-background", verifyToken, upload.single("background"), certificateTemplateController.uploadBackground);

// Delete certificate template (soft delete)
router.delete("/:id", verifyToken, certificateTemplateController.deleteTemplate);

// Permanent delete certificate template
router.delete("/:id/permanent", verifyToken, certificateTemplateController.permanentDeleteTemplate);

export default router;

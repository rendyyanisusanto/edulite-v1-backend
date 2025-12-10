import { Router } from "express";
import cardTemplateController from "../controllers/cardTemplateController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/upload.js";

const router = Router();

// Get default template (must be before /:id)
router.get("/default", verifyToken, cardTemplateController.getDefaultTemplate);

// Get all templates for user's school
router.get("/", verifyToken, cardTemplateController.getAllTemplates);

// Get background image URL (must be before /:id)
router.get("/:id/background", verifyToken, cardTemplateController.getBackgroundUrl);

// Get template by ID
router.get("/:id", verifyToken, cardTemplateController.getTemplateById);

// Create new template (with optional background image)
router.post("/", verifyToken, upload.single("background"), cardTemplateController.createTemplate);

// Update template (with optional background image)
router.put("/:id", verifyToken, upload.single("background"), cardTemplateController.updateTemplate);

// Delete template
router.delete("/:id", verifyToken, cardTemplateController.deleteTemplate);

export default router;

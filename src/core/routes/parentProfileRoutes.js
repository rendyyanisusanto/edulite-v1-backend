import express from "express";
import parentProfileController from "../controllers/parentProfileController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import { uploadDocument } from "../../middleware/upload.js";

const router = express.Router();

// Get all parents (master data)
router.get(
  "/",
  verifyToken,
  authorize("superadmin", "admin", "guru"),
  parentProfileController.getAll
);

// Get all parents for a student
router.get(
  "/student/:student_id",
  verifyToken,
  authorize("superadmin", "admin", "guru"),
  parentProfileController.getByStudent
);

// Create or update parent
router.post(
  "/student/:student_id",
  verifyToken,
  authorize("superadmin", "admin"),
  parentProfileController.saveParent
);

// Delete parent
router.delete(
  "/:id",
  verifyToken,
  authorize("superadmin", "admin"),
  parentProfileController.deleteParent
);

// Upload document
router.post(
  "/:parent_id/document",
  verifyToken,
  authorize("superadmin", "admin"),
  uploadDocument.single("document"),
  parentProfileController.uploadDocument
);

// Delete document
router.delete(
  "/document/:id",
  verifyToken,
  authorize("superadmin", "admin"),
  parentProfileController.deleteDocument
);

export default router;

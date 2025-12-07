import express from "express";
import {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all classes
router.get("/", verifyToken, authorize("superadmin", "admin", "guru"), getAllClasses);

// Get class by ID
router.get("/:id", verifyToken, getClassById);

// Create class (Admin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createClass);

// Update class (Admin only)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateClass);

// Delete class (Admin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteClass);

export default router;

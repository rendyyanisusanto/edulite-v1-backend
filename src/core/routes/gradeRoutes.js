import express from "express";
import {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/gradeController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all grades
router.get("/", verifyToken, getAllGrades);

// Get grade by ID
router.get("/:id", verifyToken, getGradeById);

// Create grade (Admin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createGrade);

// Update grade (Admin only)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateGrade);

// Delete grade (Admin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteGrade);

export default router;

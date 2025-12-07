import express from "express";
import {
  getAllAcademicYears,
  getAcademicYearById,
  getActiveAcademicYear,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
} from "../controllers/academicYearController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all academic years
router.get("/", verifyToken, getAllAcademicYears);

// Get active academic year for a school
router.get("/active/:school_id", verifyToken, getActiveAcademicYear);

// Get academic year by ID
router.get("/:id", verifyToken, getAcademicYearById);

// Create academic year (Admin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createAcademicYear);

// Update academic year (Admin only)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateAcademicYear);

// Delete academic year (Admin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteAcademicYear);

export default router;

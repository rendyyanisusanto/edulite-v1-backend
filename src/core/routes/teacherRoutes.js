import express from "express";
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all teachers
router.get("/", verifyToken, authorize("superadmin", "admin", "guru"), getAllTeachers);

// Get teacher by ID
router.get("/:id", verifyToken, getTeacherById);

// Create teacher (admin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createTeacher);

// Update teacher (admin only)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateTeacher);

// Delete teacher (admin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteTeacher);

export default router;

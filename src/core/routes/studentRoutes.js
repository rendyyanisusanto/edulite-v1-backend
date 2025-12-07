import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
  deleteStudentPhoto,
} from "../controllers/studentController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import { upload, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// Get all students (guru and admin can view)
router.get("/", verifyToken, authorize("superadmin", "admin", "guru"), getAllStudents);

// Get student by ID
router.get("/:id", verifyToken, getStudentById);

// Create student (admin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createStudent);

// Update student (admin only)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateStudent);

// Upload student photo (admin only)
router.post(
  "/:id/photo",
  verifyToken,
  authorize("superadmin", "admin"),
  upload.single("photo"),
  handleMulterError,
  uploadStudentPhoto
);

// Delete student photo (admin only)
router.delete(
  "/:id/photo",
  verifyToken,
  authorize("superadmin", "admin"),
  deleteStudentPhoto
);

// Delete student (admin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteStudent);

export default router;

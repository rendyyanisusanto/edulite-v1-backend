import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all departments
router.get("/", verifyToken, getAllDepartments);

// Get department by ID
router.get("/:id", verifyToken, getDepartmentById);

// Create department (Admin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createDepartment);

// Update department (Admin only)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateDepartment);

// Delete department (Admin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteDepartment);

export default router;

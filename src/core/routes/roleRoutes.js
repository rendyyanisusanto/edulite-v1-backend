import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/roleController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all roles
router.get("/", verifyToken, getAllRoles);

// Get role by ID
router.get("/:id", verifyToken, getRoleById);

// Create role (SuperAdmin only)
router.post("/", verifyToken, authorize("superadmin"), createRole);

// Update role (SuperAdmin only)
router.put("/:id", verifyToken, authorize("superadmin"), updateRole);

// Delete role (SuperAdmin only)
router.delete("/:id", verifyToken, authorize("superadmin"), deleteRole);

export default router;

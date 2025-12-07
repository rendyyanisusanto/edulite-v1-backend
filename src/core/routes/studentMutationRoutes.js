import express from "express";
import {
  getAllStudentMutations,
  getStudentMutationById,
  createStudentMutation,
  updateStudentMutation,
  deleteStudentMutation,
} from "../controllers/studentMutationController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all schools (SuperAdmin only)
router.get("/", verifyToken, authorize("superadmin", "admin"), getAllStudentMutations);

// Get school by ID
router.get("/:id", verifyToken, getStudentMutationById);
    
// Create school (SuperAdmin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createStudentMutation);

// Update school (SuperAdmin or AdminSekolah)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateStudentMutation);

// Delete school (SuperAdmin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteStudentMutation);

export default router;

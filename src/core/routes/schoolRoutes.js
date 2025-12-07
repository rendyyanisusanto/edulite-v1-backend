import express from "express";
import {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  deleteSchool,
} from "../controllers/schoolController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all schools (SuperAdmin only)
router.get("/", verifyToken, authorize("superadmin"), getAllSchools);

// Get school by ID
router.get("/:id", verifyToken, getSchoolById);

// Create school (SuperAdmin only)
router.post("/", verifyToken, authorize("superadmin"), createSchool);

// Update school (SuperAdmin or AdminSekolah)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateSchool);

// Delete school (SuperAdmin only)
router.delete("/:id", verifyToken, authorize("superadmin"), deleteSchool);

export default router;

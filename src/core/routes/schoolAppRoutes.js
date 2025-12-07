import express from "express";
import {
  getAllSchoolApps,
  getSchoolAppById,
  createSchoolApp,
  updateSchoolApp,
  deleteSchoolApp,
} from "../controllers/schoolAppController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all school apps
router.get("/", verifyToken, getAllSchoolApps);

// Get school app by ID
router.get("/:id", verifyToken, getSchoolAppById);

// Create school app (SuperAdmin or AdminSekolah)
router.post("/", verifyToken, authorize("superadmin", "admin"), createSchoolApp);

// Update school app (SuperAdmin or AdminSekolah)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateSchoolApp);

// Delete school app (SuperAdmin or AdminSekolah)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteSchoolApp);

export default router;

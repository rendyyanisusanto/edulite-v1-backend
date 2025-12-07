import express from "express";
import {
  getAllApps,
  getAppById,
  createApp,
  updateApp,
  deleteApp,
} from "../controllers/appController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all apps
router.get("/", verifyToken, getAllApps);

// Get app by ID
router.get("/:id", verifyToken, getAppById);

// Create app (SuperAdmin only)
router.post("/", verifyToken, authorize("superadmin"), createApp);

// Update app (SuperAdmin only)
router.put("/:id", verifyToken, authorize("superadmin"), updateApp);

// Delete app (SuperAdmin only)
router.delete("/:id", verifyToken, authorize("superadmin"), deleteApp);

export default router;

import express from "express";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import { uploadDocument } from "../../middleware/upload.js";
import {
  // Reward Levels
  getAllRewardLevels,
  getRewardLevelById,
  createRewardLevel,
  updateRewardLevel,
  deleteRewardLevel,
  // Reward Types
  getAllRewardTypes,
  getRewardTypeById,
  createRewardType,
  updateRewardType,
  deleteRewardType,
  // Reward Actions
  getAllRewardActions,
  getRewardActionById,
  createRewardAction,
  updateRewardAction,
  deleteRewardAction,
  // Student Rewards
  getAllStudentRewards,
  getStudentRewardById,
  createStudentReward,
  updateStudentReward,
  deleteStudentReward,
  uploadRewardEvidence,
  approveReward,
  rejectReward,
  actionReward,
} from "../controllers/rewardController.js";

const router = express.Router();

// ==================== REWARD LEVELS ====================
router.get("/levels", verifyToken, authorize("superadmin", "admin", "guru"), getAllRewardLevels);
router.get("/levels/:id", verifyToken, authorize("superadmin", "admin", "guru"), getRewardLevelById);
router.post("/levels", verifyToken, authorize("superadmin", "admin"), createRewardLevel);
router.put("/levels/:id", verifyToken, authorize("superadmin", "admin"), updateRewardLevel);
router.delete("/levels/:id", verifyToken, authorize("superadmin", "admin"), deleteRewardLevel);

// ==================== REWARD TYPES ====================
router.get("/types", verifyToken, authorize("superadmin", "admin", "guru"), getAllRewardTypes);
router.get("/types/:id", verifyToken, authorize("superadmin", "admin", "guru"), getRewardTypeById);
router.post("/types", verifyToken, authorize("superadmin", "admin"), createRewardType);
router.put("/types/:id", verifyToken, authorize("superadmin", "admin"), updateRewardType);
router.delete("/types/:id", verifyToken, authorize("superadmin", "admin"), deleteRewardType);

// ==================== REWARD ACTIONS ====================
router.get("/actions", verifyToken, authorize("superadmin", "admin", "guru"), getAllRewardActions);
router.get("/actions/:id", verifyToken, authorize("superadmin", "admin", "guru"), getRewardActionById);
router.post("/actions", verifyToken, authorize("superadmin", "admin"), createRewardAction);
router.put("/actions/:id", verifyToken, authorize("superadmin", "admin"), updateRewardAction);
router.delete("/actions/:id", verifyToken, authorize("superadmin", "admin"), deleteRewardAction);

// ==================== STUDENT REWARDS ====================
router.get("/students", verifyToken, authorize("superadmin", "admin", "guru"), getAllStudentRewards);
router.get("/students/:id", verifyToken, authorize("superadmin", "admin", "guru"), getStudentRewardById);
router.post("/students", verifyToken, authorize("superadmin", "admin", "guru"), createStudentReward);
router.put("/students/:id", verifyToken, authorize("superadmin", "admin", "guru"), updateStudentReward);
router.delete("/students/:id", verifyToken, authorize("superadmin", "admin", "guru"), deleteStudentReward);

// Evidence upload
router.post("/students/:id/evidence", verifyToken, authorize("superadmin", "admin", "guru"), uploadDocument.single("file"), uploadRewardEvidence);

// Status management
router.post("/students/:id/approve", verifyToken, authorize("superadmin", "admin"), approveReward);
router.post("/students/:id/reject", verifyToken, authorize("superadmin", "admin"), rejectReward);
router.post("/students/:id/action", verifyToken, authorize("superadmin", "admin"), actionReward);

export default router;

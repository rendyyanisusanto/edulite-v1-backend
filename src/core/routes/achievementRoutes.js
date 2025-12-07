import express from "express";
import {
  getAllAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  addParticipant,
  updateParticipant,
  deleteParticipant,
  addResult,
  updateResult,
  deleteResult,
  uploadCertificate,
  deleteCertificate,
  uploadDocument,
  deleteDocument,
  getAchievementStatistics,
} from "../controllers/achievementController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import  { upload, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// Achievement routes
router.get("/", verifyToken, getAllAchievements);
router.get("/statistics", verifyToken, getAchievementStatistics);
router.get("/:id", verifyToken, getAchievementById);
router.post("/", verifyToken, createAchievement);
router.put("/:id", verifyToken, updateAchievement);
router.delete("/:id", verifyToken, deleteAchievement);
// Participant routes
router.post("/:achievement_id/participants", verifyToken, addParticipant);
router.put(
  "/:achievement_id/participants/:participant_id",
  verifyToken,
  updateParticipant
);
router.delete(
  "/:achievement_id/participants/:participant_id",
  verifyToken,
  deleteParticipant
);

// Result routes
router.post(
  "/:achievement_id/participants/:participant_id/results",
  verifyToken,
  addResult
);
router.put(
  "/:achievement_id/participants/:participant_id/results/:result_id",
  verifyToken,
  updateResult
);
router.delete(
  "/:achievement_id/participants/:participant_id/results/:result_id",
  verifyToken,
  deleteResult
);

// Certificate upload routes
router.post(
  "/:achievement_id/participants/:participant_id/results/:result_id/certificate",
  verifyToken,
  upload.single("certificate"),
  handleMulterError,
  uploadCertificate
);
router.delete(
  "/:achievement_id/participants/:participant_id/results/:result_id/certificate",
  verifyToken,
  deleteCertificate
);

// Document routes
router.post(
  "/:achievement_id/documents",
  verifyToken,
  upload.single("file"),
  handleMulterError,
  uploadDocument
);
router.delete(
  "/:achievement_id/documents/:document_id",
  verifyToken,
  deleteDocument
);

export default router;

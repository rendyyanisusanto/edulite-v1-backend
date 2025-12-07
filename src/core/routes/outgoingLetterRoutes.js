import express from "express";
import {
  getAllOutgoingLetters,
  getOutgoingLetterById,
  createOutgoingLetter,
  updateOutgoingLetter,
  submitForApproval,
  approveOrRejectLetter,
  sendLetter,
  archiveLetter,
  deleteOutgoingLetter,
  uploadAttachment,
  deleteAttachment,
} from "../controllers/outgoingLetterController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { upload, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// Outgoing letter routes
router.get("/", verifyToken, getAllOutgoingLetters);
router.get("/:id", verifyToken, getOutgoingLetterById);
router.post("/", verifyToken, createOutgoingLetter);
router.put("/:id", verifyToken, updateOutgoingLetter);
router.post("/:id/submit", verifyToken, submitForApproval);
router.post("/:id/approve-reject", verifyToken, approveOrRejectLetter);
router.post("/:id/send", verifyToken, sendLetter);
router.post("/:id/archive", verifyToken, archiveLetter);
router.delete("/:id", verifyToken, deleteOutgoingLetter);

// Attachment routes
router.post(
  "/:id/attachments",
  verifyToken,
  upload.single("file"),
  handleMulterError,
  uploadAttachment
);
router.delete("/:id/attachments/:attachment_id", verifyToken, deleteAttachment);

export default router;

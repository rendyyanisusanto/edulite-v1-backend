import express from "express";
import {
  getAllIncomingLetters,
  getIncomingLetterById,
  createIncomingLetter,
  updateIncomingLetter,
  updateLetterStatus,
  deleteIncomingLetter,
  uploadAttachment,
  deleteAttachment,
  createDisposition,
  updateDispositionStatus,
} from "../controllers/incomingLetterController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { upload, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// Incoming letter routes
router.get("/", verifyToken, getAllIncomingLetters);
router.get("/:id", verifyToken, getIncomingLetterById);
router.post("/", verifyToken, createIncomingLetter);
router.put("/:id", verifyToken, updateIncomingLetter);
router.patch("/:id/status", verifyToken, updateLetterStatus);
router.delete("/:id", verifyToken, deleteIncomingLetter);

// Attachment routes
router.post(
  "/:id/attachments",
  verifyToken,
  upload.single("file"),
  handleMulterError,
  uploadAttachment
);
router.delete("/:id/attachments/:attachment_id", verifyToken, deleteAttachment);

// Disposition routes
router.post("/:id/dispositions", verifyToken, createDisposition);
router.patch("/:id/dispositions/:disposition_id/status", verifyToken, updateDispositionStatus);

export default router;

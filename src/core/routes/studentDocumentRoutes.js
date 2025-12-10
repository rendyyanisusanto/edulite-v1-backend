import express from "express";
import {
  getAllDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  getAllStudentDocuments,
  getStudentDocumentsByStudentId,
  getStudentDocumentById,
  createStudentDocument,
  uploadDocumentFile,
  updateStudentDocument,
  deleteStudentDocument,
  deleteDocumentFile,
  getDocumentStatistics,
} from "../controllers/studentDocumentController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";
import { uploadDocument, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// ==================== DOCUMENT TYPES ROUTES ====================
router.get("/types", verifyToken, getAllDocumentTypes);
router.get("/types/:id", verifyToken, getDocumentTypeById);
router.post("/types", verifyToken, createDocumentType);
router.put("/types/:id", verifyToken, updateDocumentType);
router.delete("/types/:id", verifyToken, deleteDocumentType);

// ==================== STUDENT DOCUMENTS ROUTES ====================
router.get("/", verifyToken, getAllStudentDocuments);
router.get("/statistics", verifyToken, getDocumentStatistics);
router.get("/student/:student_id", verifyToken, getStudentDocumentsByStudentId);
router.get("/:id", verifyToken, getStudentDocumentById);
router.post("/", verifyToken, createStudentDocument);
router.put("/:id", verifyToken, updateStudentDocument);
router.delete("/:id", verifyToken, deleteStudentDocument);

// File upload routes
router.post(
  "/:id/upload",
  verifyToken,
  uploadDocument.single("file"),
  handleMulterError,
  uploadDocumentFile
);
router.delete("/:id/file", verifyToken, deleteDocumentFile);

export default router;

import express from "express";
import {
  getAllStudents,
  getStudentById,
  searchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
  deleteStudentPhoto,
  getClassesForImport,
  importStudentsFromExcel,
  downloadExcelTemplate,
  generateCardNumber,
  generateQRCode,
  generateBarcode,
  assignCardTemplate,
  getStudentCard,
  generateAllCardData,
} from "../controllers/studentController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import { upload, uploadExcel, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// Download Excel template
router.get("/template/download", verifyToken, authorize("superadmin", "admin"), downloadExcelTemplate);

// Get classes for import
router.get("/classes", verifyToken, authorize("superadmin", "admin"), getClassesForImport);

// Search students
router.get("/search", verifyToken, searchStudents);

// Import students from Excel
router.post(
  "/import",
  verifyToken,
  authorize("superadmin", "admin"),
  uploadExcel.single("file"),
  handleMulterError,
  importStudentsFromExcel
);

// Get all students (guru and admin can view)
router.get("/", verifyToken, authorize("superadmin", "admin", "guru"), getAllStudents);

// Get student by ID
router.get("/:id", verifyToken, getStudentById);

// Create student (admin only)
router.post("/", verifyToken, authorize("superadmin", "admin"), createStudent);

// Update student (admin only)
router.put("/:id", verifyToken, authorize("superadmin", "admin"), updateStudent);

// Upload student photo (admin only)
router.post(
  "/:id/photo",
  verifyToken,
  authorize("superadmin", "admin"),
  upload.single("photo"),
  handleMulterError,
  uploadStudentPhoto
);

// Delete student photo (admin only)
router.delete(
  "/:id/photo",
  verifyToken,
  authorize("superadmin", "admin"),
  deleteStudentPhoto
);

// Card management routes
// Get student card with template
router.get("/:id/card", verifyToken, getStudentCard);

// Generate card number
router.post(
  "/:id/card/number",
  verifyToken,
  authorize("superadmin", "admin"),
  generateCardNumber
);

// Generate QR code
router.post(
  "/:id/card/qrcode",
  verifyToken,
  authorize("superadmin", "admin"),
  generateQRCode
);

// Generate barcode
router.post(
  "/:id/card/barcode",
  verifyToken,
  authorize("superadmin", "admin"),
  generateBarcode
);

// Generate all card data (number, QR, barcode)
router.post(
  "/:id/card/generate",
  verifyToken,
  authorize("superadmin", "admin"),
  generateAllCardData
);

// Assign card template
router.put(
  "/:id/card/template",
  verifyToken,
  authorize("superadmin", "admin"),
  assignCardTemplate
);

// Delete student (admin only)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteStudent);

export default router;

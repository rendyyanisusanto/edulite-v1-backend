import express from "express";
import {
    getAllStudentCertificates,
    getStudentCertificateById,
    createStudentCertificate,
    updateStudentCertificate,
    deleteStudentCertificate,
    uploadCertificateFile,
    deleteCertificateFile,
    generateCertificatePDF,
} from "../controllers/studentCertificateController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import { upload, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// Get all student certificates
router.get(
    "/",
    verifyToken,
    authorize("superadmin", "admin", "guru"),
    getAllStudentCertificates
);

// Get student certificate by ID
router.get(
    "/:id",
    verifyToken,
    authorize("superadmin", "admin", "guru"),
    getStudentCertificateById
);

// Generate certificate PDF data
router.get(
    "/:id/generate",
    verifyToken,
    authorize("superadmin", "admin", "guru"),
    generateCertificatePDF
);

// Create student certificate (admin only)
router.post(
    "/",
    verifyToken,
    authorize("superadmin", "admin"),
    createStudentCertificate
);

// Update student certificate (admin only)
router.put(
    "/:id",
    verifyToken,
    authorize("superadmin", "admin"),
    updateStudentCertificate
);

// Upload certificate file (PDF)
router.post(
    "/:id/file",
    verifyToken,
    authorize("superadmin", "admin"),
    upload.single("file"),
    handleMulterError,
    uploadCertificateFile
);

// Delete certificate file
router.delete(
    "/:id/file",
    verifyToken,
    authorize("superadmin", "admin"),
    deleteCertificateFile
);

// Delete student certificate (admin only)
router.delete(
    "/:id",
    verifyToken,
    authorize("superadmin", "admin"),
    deleteStudentCertificate
);

export default router;

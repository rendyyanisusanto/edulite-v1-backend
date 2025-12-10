import express from "express";
import {
  // Violation Levels
  getAllViolationLevels,
  getViolationLevelById,
  createViolationLevel,
  updateViolationLevel,
  deleteViolationLevel,
  
  // Violation Types
  getAllViolationTypes,
  getViolationTypeById,
  createViolationType,
  updateViolationType,
  deleteViolationType,
  
  // Violation Actions
  getAllViolationActions,
  getViolationActionById,
  createViolationAction,
  updateViolationAction,
  deleteViolationAction,
  
  // Student Violations
  getAllStudentViolations,
  getStudentViolationById,
  createStudentViolation,
  updateStudentViolation,
  approveStudentViolation,
  uploadViolationEvidence,
  deleteStudentViolation,
  getViolationStatsByStudent,
} from "../controllers/violationController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";
import { uploadDocument, handleMulterError } from "../../middleware/upload.js";

const router = express.Router();

// ==================== VIOLATION LEVELS ROUTES ====================

// Get all violation levels
router.get("/levels", verifyToken, authorize("superadmin", "admin", "guru"), getAllViolationLevels);

// Get violation level by ID
router.get("/levels/:id", verifyToken, authorize("superadmin", "admin", "guru"), getViolationLevelById);

// Create violation level
router.post("/levels", verifyToken, authorize("superadmin", "admin"), createViolationLevel);

// Update violation level
router.put("/levels/:id", verifyToken, authorize("superadmin", "admin"), updateViolationLevel);

// Delete violation level
router.delete("/levels/:id", verifyToken, authorize("superadmin", "admin"), deleteViolationLevel);

// ==================== VIOLATION TYPES ROUTES ====================

// Get all violation types
router.get("/types", verifyToken, authorize("superadmin", "admin", "guru"), getAllViolationTypes);

// Get violation type by ID
router.get("/types/:id", verifyToken, authorize("superadmin", "admin", "guru"), getViolationTypeById);

// Create violation type
router.post("/types", verifyToken, authorize("superadmin", "admin"), createViolationType);

// Update violation type
router.put("/types/:id", verifyToken, authorize("superadmin", "admin"), updateViolationType);

// Delete violation type
router.delete("/types/:id", verifyToken, authorize("superadmin", "admin"), deleteViolationType);

// ==================== VIOLATION ACTIONS ROUTES ====================

// Get all violation actions
router.get("/actions", verifyToken, authorize("superadmin", "admin", "guru"), getAllViolationActions);

// Get violation action by ID
router.get("/actions/:id", verifyToken, authorize("superadmin", "admin", "guru"), getViolationActionById);

// Create violation action
router.post("/actions", verifyToken, authorize("superadmin", "admin"), createViolationAction);

// Update violation action
router.put("/actions/:id", verifyToken, authorize("superadmin", "admin"), updateViolationAction);

// Delete violation action
router.delete("/actions/:id", verifyToken, authorize("superadmin", "admin"), deleteViolationAction);

// ==================== STUDENT VIOLATIONS ROUTES ====================

// Get violation stats by student
router.get("/students/:student_id/stats", verifyToken, authorize("superadmin", "admin", "guru"), getViolationStatsByStudent);

// Get all student violations
router.get("/students", verifyToken, authorize("superadmin", "admin", "guru"), getAllStudentViolations);

// Get student violation by ID
router.get("/students/:id", verifyToken, authorize("superadmin", "admin", "guru"), getStudentViolationById);

// Create student violation
router.post("/students", verifyToken, authorize("superadmin", "admin", "guru"), createStudentViolation);

// Update student violation
router.put("/students/:id", verifyToken, authorize("superadmin", "admin", "guru"), updateStudentViolation);

// Approve/reject violation
router.put("/students/:id/approve", verifyToken, authorize("superadmin", "admin"), approveStudentViolation);

// Upload evidence file
router.post(
  "/students/:id/evidence",
  verifyToken,
  authorize("superadmin", "admin", "guru"),
  uploadDocument.single("evidence"),
  handleMulterError,
  uploadViolationEvidence
);

// Delete student violation
router.delete("/students/:id", verifyToken, authorize("superadmin", "admin"), deleteStudentViolation);

export default router;

import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import {
    getStudentSummary,
    getStudentCases,
    getCaseDetail,
    getClassSummary,
    getClassStudents
} from '../controllers/counselingRecapController.js';

const router = express.Router();

/**
 * Counseling Recap Routes
 * Routes untuk rekap konseling per siswa dan per kelas
 */

// Student Recap Routes
// Get student counseling summary
router.get('/student/:studentId/summary', verifyToken, authorize('superadmin', 'admin', 'guru'), getStudentSummary);

// Get student cases with filters
router.get('/student/:studentId/cases', verifyToken, authorize('superadmin', 'admin', 'guru'), getStudentCases);

// Get complete case detail
router.get('/case/:caseId/detail', verifyToken, authorize('superadmin', 'admin', 'guru'), getCaseDetail);

// Class Recap Routes
// Get class counseling summary
router.get('/class/:classId/summary', verifyToken, authorize('superadmin', 'admin', 'guru'), getClassSummary);

// Get class students with counseling recap
router.get('/class/:classId/students', verifyToken, authorize('superadmin', 'admin', 'guru'), getClassStudents);

export default router;

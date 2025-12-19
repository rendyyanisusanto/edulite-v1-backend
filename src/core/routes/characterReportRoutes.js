import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import { getStudentCharacterReport } from '../controllers/characterReportController.js';

const router = express.Router();

/**
 * Character Report Routes
 * Routes untuk rapor karakter siswa
 */

// Get student character report
router.get('/student/:studentId', verifyToken, authorize('superadmin', 'admin', 'guru'), getStudentCharacterReport);

export default router;

import express from 'express';
import {
    getAchievementReport,
    getReportSummary,
    getPerStudentView,
    getPerClassView,
    exportReportExcel,
    exportReportPDF
} from '../controllers/achievementReportController.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Get main achievement report
router.get('/', verifyToken, authorize('superadmin', 'admin', 'guru'), getAchievementReport);

// Get report summary statistics
router.get('/summary', verifyToken, authorize('superadmin', 'admin', 'guru'), getReportSummary);

// Get per-student view
router.get('/per-student', verifyToken, authorize('superadmin', 'admin', 'guru'), getPerStudentView);

// Get per-class view
router.get('/per-class', verifyToken, authorize('superadmin', 'admin', 'guru'), getPerClassView);

// Export to Excel
router.get('/export/excel', verifyToken, authorize('superadmin', 'admin', 'guru'), exportReportExcel);

// Export to PDF
router.get('/export/pdf', verifyToken, authorize('superadmin', 'admin', 'guru'), exportReportPDF);

export default router;

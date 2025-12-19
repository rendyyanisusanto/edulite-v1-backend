import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import * as counselingReportController from '../controllers/counselingReportController.js';

const router = express.Router();

// Get counseling report with aggregated data
router.get('/', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingReportController.getCounselingReport);

// Export counseling report to Excel
router.get('/export/excel', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingReportController.exportCounselingReportExcel);

// Export counseling report to PDF
router.get('/export/pdf', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingReportController.exportCounselingReportPDF);

export default router;

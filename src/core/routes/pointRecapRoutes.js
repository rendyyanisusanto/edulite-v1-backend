import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import * as pointRecapController from '../controllers/pointRecapController.js';

const router = express.Router();

// Get student point recap with filters
router.get('/students', verifyToken, authorize('superadmin', 'admin', 'guru'), pointRecapController.getStudentPointRecap);

// Get single student point detail
router.get('/students/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), pointRecapController.getStudentPointDetail);

// Get class point recap
router.get('/classes', verifyToken, authorize('superadmin', 'admin', 'guru'), pointRecapController.getClassPointRecap);

// Get grade point recap
router.get('/grades', verifyToken, authorize('superadmin', 'admin', 'guru'), pointRecapController.getGradePointRecap);

// Get real-time class point summary
router.get('/class-summary', verifyToken, authorize('superadmin', 'admin', 'guru'), pointRecapController.getClassPointSummary);

// Get dashboard statistics
router.get('/dashboard', verifyToken, authorize('superadmin', 'admin', 'guru'), pointRecapController.getDashboardStats);

// Export point recap data
router.get('/export', verifyToken, authorize('superadmin', 'admin', 'guru'), pointRecapController.exportPointRecap);

export default router;

import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import * as counselingCaseController from '../controllers/counselingCaseController.js';

const router = express.Router();

// Get all counseling cases with filters
router.get('/', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingCaseController.getCounselingCases);

// Get counseling case statistics
router.get('/stats', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingCaseController.getCounselingCaseStats);

// Get counseling case by ID
router.get('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingCaseController.getCounselingCaseById);

// Create new counseling case
router.post('/', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingCaseController.createCounselingCase);

// Update counseling case
router.put('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), counselingCaseController.updateCounselingCase);

// Delete counseling case
router.delete('/:id', verifyToken, authorize('superadmin', 'admin'), counselingCaseController.deleteCounselingCase);

export default router;
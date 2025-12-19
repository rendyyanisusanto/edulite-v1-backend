import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import {
    getCounselingFollowups,
    getCounselingFollowupById,
    createCounselingFollowup,
    updateCounselingFollowup,
    deleteCounselingFollowup
} from '../controllers/counselingFollowupController.js';

const router = express.Router();

// Get all counseling followups
router.get('/', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingFollowups);

// Get counseling followup by ID
router.get('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingFollowupById);

// Create new counseling followup
router.post('/', verifyToken, authorize('superadmin', 'admin', 'guru'), createCounselingFollowup);

// Update counseling followup
router.put('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), updateCounselingFollowup);

// Delete counseling followup
router.delete('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), deleteCounselingFollowup);

export default router;

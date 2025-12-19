import express from 'express';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import {
  getCounselingSessions,
  getCounselingSessionById,
  createCounselingSession,
  updateCounselingSession,
  deleteCounselingSession,
  getCounselingSessionStats
} from '../controllers/counselingSessionController.js';

const router = express.Router();

// Get all counseling sessions
router.get('/', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingSessions);

// Get counseling session statistics
router.get('/stats', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingSessionStats);

// Get counseling session by ID
router.get('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingSessionById);

// Create new counseling session
router.post('/', verifyToken, authorize('superadmin', 'admin', 'guru'), createCounselingSession);

// Update counseling session
router.put('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), updateCounselingSession);

// Delete counseling session
router.delete('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), deleteCounselingSession);

export default router;
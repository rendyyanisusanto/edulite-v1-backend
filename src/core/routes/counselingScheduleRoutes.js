import express from 'express';
import {
    getCounselingSchedules,
    getCounselingScheduleById,
    createCounselingSchedule,
    updateCounselingSchedule,
    deleteCounselingSchedule,
    getCounselingScheduleStats
} from '../controllers/counselingScheduleController.js';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Statistics route (must be before :id route)
router.get('/stats', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingScheduleStats);

// CRUD routes
router.get('/', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingSchedules);
router.get('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), getCounselingScheduleById);
router.post('/', verifyToken, authorize('superadmin', 'admin', 'guru'), createCounselingSchedule);
router.put('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), updateCounselingSchedule);
router.delete('/:id', verifyToken, authorize('superadmin', 'admin'), deleteCounselingSchedule);

export default router;

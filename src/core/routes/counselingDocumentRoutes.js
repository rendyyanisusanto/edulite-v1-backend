import express from 'express';
import multer from 'multer';
import { verifyToken, authorize } from '../../middleware/authMiddleware.js';
import {
    uploadDocument,
    getDocuments,
    deleteDocument
} from '../controllers/counselingDocumentController.js';

const router = express.Router();

// Configure multer for document upload
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Upload document
router.post(
    '/upload',
    verifyToken,
    authorize('superadmin', 'admin', 'guru'),
    upload.single('file'),
    uploadDocument
);

// Get documents
router.get('/', verifyToken, authorize('superadmin', 'admin', 'guru'), getDocuments);

// Delete document
router.delete('/:id', verifyToken, authorize('superadmin', 'admin', 'guru'), deleteDocument);

export default router;

import { CounselingDocument, CounselingCase, User } from '../models/index.js';
import { uploadFile, deleteFile } from '../../config/minio.js';

/**
 * Upload document
 */
export const uploadDocument = async (req, res) => {
    try {
        const { case_id, document_type, reference_id, description } = req.body;
        const file = req.file;

        // Check if user is authenticated
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated. Please login again.'
            });
        }

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        if (!case_id || !document_type) {
            return res.status(400).json({
                success: false,
                message: 'case_id and document_type are required'
            });
        }

        // Verify case exists
        const counselingCase = await CounselingCase.findByPk(case_id);
        if (!counselingCase) {
            return res.status(404).json({
                success: false,
                message: 'Counseling case not found'
            });
        }

        // Determine folder based on document type
        let folder = 'counseling-documents/cases';
        if (document_type === 'SESSION') {
            folder = 'counseling-documents/sessions';
        } else if (document_type === 'FOLLOWUP') {
            folder = 'counseling-documents/followups';
        }

        // Add reference_id to folder if provided
        if (reference_id) {
            folder += `/${reference_id}`;
        } else {
            folder += `/${case_id}`;
        }

        // Upload to MinIO
        const uploadResult = await uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            folder
        );

        console.log('MinIO upload successful:', uploadResult);
        console.log('Saving to database with user ID:', req.user.user_id);

        // Save to database - use req.user.user_id not req.user.id
        const document = await CounselingDocument.create({
            case_id,
            document_type,
            reference_id: reference_id || null,
            file_path: uploadResult.key,
            file_name: file.originalname,
            file_size: file.size,
            mime_type: file.mimetype,
            description: description || null,
            created_by: req.user.user_id  // FIXED: use user_id from JWT payload
        });

        console.log('Database save successful:', document.id);

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                ...document.toJSON(),
                url: uploadResult.url
            }
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to upload document',
            error: error.message
        });
    }
};

/**
 * Get documents
 */
export const getDocuments = async (req, res) => {
    try {
        const { case_id, document_type, reference_id } = req.query;

        const whereConditions = {};
        if (case_id) whereConditions.case_id = case_id;
        if (document_type) whereConditions.document_type = document_type;
        if (reference_id) whereConditions.reference_id = reference_id;

        const documents = await CounselingDocument.findAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Add full URL to each document
        const documentsWithUrl = documents.map(doc => ({
            ...doc.toJSON(),
            url: `https://objectstorage.simsmk.sch.id/edulite/${doc.file_path}`
        }));

        res.json({
            success: true,
            data: documentsWithUrl
        });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
            error: error.message
        });
    }
};

/**
 * Delete document
 */
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await CounselingDocument.findByPk(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Delete from MinIO
        try {
            await deleteFile(document.file_path);
        } catch (minioError) {
            console.error('MinIO delete error:', minioError);
            // Continue even if MinIO delete fails
        }

        // Delete from database
        await document.destroy();

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: error.message
        });
    }
};

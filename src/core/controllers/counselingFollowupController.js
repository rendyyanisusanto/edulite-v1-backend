import { CounselingFollowup, CounselingSession, CounselingCase, Student, Teacher } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

/**
 * Counseling Followup Controller
 * Handle CRUD operations untuk data tindak lanjut konseling
 */

/**
 * Get all counseling followups with filters
 */
export const getCounselingFollowups = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search,
            status,
            session_id,
            start_date,
            end_date
        } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = {};

        // Build filter conditions
        if (status) whereConditions.status = status;
        if (session_id) whereConditions.session_id = session_id;

        // Date range filter
        if (start_date || end_date) {
            whereConditions.followup_date = {};
            if (start_date) whereConditions.followup_date[Op.gte] = new Date(start_date);
            if (end_date) whereConditions.followup_date[Op.lte] = new Date(end_date);
        }

        // Include associations
        const include = [
            {
                model: CounselingSession,
                as: 'counseling_session',
                include: [
                    {
                        model: CounselingCase,
                        as: 'counseling_case',
                        include: [
                            {
                                model: Student,
                                as: 'student',
                                attributes: ['id', 'nis', 'nisn', 'name', 'gender']
                            }
                        ]
                    }
                ]
            },
            {
                model: Teacher,
                as: 'followup_teacher',
                attributes: ['id', 'name', 'nip']
            }
        ];

        // Search functionality
        if (search) {
            whereConditions[Op.or] = [
                { notes: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await CounselingFollowup.findAndCountAll({
            where: whereConditions,
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['followup_date', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching counseling followups:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data tindak lanjut konseling',
            error: error.message
        });
    }
};

/**
 * Get counseling followup by ID
 */
export const getCounselingFollowupById = async (req, res) => {
    try {
        const { id } = req.params;

        const counselingFollowup = await CounselingFollowup.findOne({
            where: { id },
            include: [
                {
                    model: CounselingSession,
                    as: 'counseling_session',
                    include: [
                        {
                            model: CounselingCase,
                            as: 'counseling_case',
                            include: [
                                {
                                    model: Student,
                                    as: 'student',
                                    attributes: ['id', 'nis', 'nisn', 'name', 'gender', 'photo']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Teacher,
                    as: 'followup_teacher',
                    attributes: ['id', 'name', 'nip']
                }
            ]
        });

        if (!counselingFollowup) {
            return res.status(404).json({
                success: false,
                message: 'Data tindak lanjut konseling tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: counselingFollowup
        });
    } catch (error) {
        console.error('Error fetching counseling followup:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail tindak lanjut konseling',
            error: error.message
        });
    }
};

/**
 * Create new counseling followup
 */
export const createCounselingFollowup = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            session_id,
            followup_by,
            followup_date,
            notes,
            status
        } = req.body;

        // Validation
        if (!session_id || !followup_by || !followup_date || !status) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Session ID, followup by, followup date, dan status wajib diisi'
            });
        }

        // Check if counseling session exists
        const counselingSession = await CounselingSession.findOne({
            where: { id: session_id },
            transaction
        });

        if (!counselingSession) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Sesi konseling tidak ditemukan'
            });
        }

        const counselingFollowup = await CounselingFollowup.create({
            session_id,
            followup_by,
            followup_date,
            notes,
            status
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Data tindak lanjut konseling berhasil dibuat',
            data: counselingFollowup
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating counseling followup:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat data tindak lanjut konseling',
            error: error.message
        });
    }
};

/**
 * Update counseling followup
 */
export const updateCounselingFollowup = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            followup_by,
            followup_date,
            notes,
            status
        } = req.body;

        const counselingFollowup = await CounselingFollowup.findOne({
            where: { id },
            transaction
        });

        if (!counselingFollowup) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Data tindak lanjut konseling tidak ditemukan'
            });
        }

        await counselingFollowup.update({
            followup_by,
            followup_date,
            notes,
            status
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Data tindak lanjut konseling berhasil diperbarui',
            data: counselingFollowup
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating counseling followup:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui data tindak lanjut konseling',
            error: error.message
        });
    }
};

/**
 * Delete counseling followup
 */
export const deleteCounselingFollowup = async (req, res) => {
    try {
        const { id } = req.params;

        const counselingFollowup = await CounselingFollowup.findOne({
            where: { id }
        });

        if (!counselingFollowup) {
            return res.status(404).json({
                success: false,
                message: 'Data tindak lanjut konseling tidak ditemukan'
            });
        }

        await counselingFollowup.destroy();

        res.json({
            success: true,
            message: 'Data tindak lanjut konseling berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting counseling followup:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data tindak lanjut konseling',
            error: error.message
        });
    }
};

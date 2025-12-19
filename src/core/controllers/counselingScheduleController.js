import { CounselingSchedule, CounselingCase, Teacher, School, Student } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

/**
 * Counseling Schedule Controller
 * Handle CRUD operations untuk jadwal konseling
 */

/**
 * Get all counseling schedules with filters
 */
export const getCounselingSchedules = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            search,
            status,
            case_id,
            counselor_id,
            start_date,
            end_date
        } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = {
            school_id: req.user.school_id
        };

        // Build filter conditions
        if (status) whereConditions.status = status;
        if (case_id) whereConditions.case_id = case_id;
        if (counselor_id) whereConditions.counselor_id = counselor_id;

        // Date range filter
        if (start_date && end_date) {
            whereConditions.schedule_date = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            whereConditions.schedule_date = {
                [Op.gte]: new Date(start_date)
            };
        } else if (end_date) {
            whereConditions.schedule_date = {
                [Op.lte]: new Date(end_date)
            };
        }

        // Include associations
        const include = [
            {
                model: CounselingCase,
                as: 'counseling_case',
                attributes: ['id', 'issue_title', 'category', 'level', 'status'],
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'nis', 'name', 'class_id']
                    }
                ]
            },
            {
                model: Teacher,
                as: 'counselor',
                attributes: ['id', 'name', 'nip'],
                required: false
            }
        ];

        // Search functionality
        if (search) {
            include[0].where = {
                [Op.or]: [
                    { issue_title: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await CounselingSchedule.findAndCountAll({
            where: whereConditions,
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['schedule_date', 'DESC']]
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
        console.error('Error fetching counseling schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data jadwal konseling',
            error: error.message
        });
    }
};

/**
 * Get counseling schedule by ID
 */
export const getCounselingScheduleById = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await CounselingSchedule.findOne({
            where: {
                id,
                school_id: req.user.school_id
            },
            include: [
                {
                    model: CounselingCase,
                    as: 'counseling_case',
                    attributes: ['id', 'issue_title', 'issue_description', 'category', 'level', 'status'],
                    include: [
                        {
                            model: Student,
                            as: 'student',
                            attributes: ['id', 'nis', 'nisn', 'name', 'gender']
                        }
                    ]
                },
                {
                    model: Teacher,
                    as: 'counselor',
                    attributes: ['id', 'name', 'nip']
                }
            ]
        });

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Data jadwal konseling tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: schedule
        });
    } catch (error) {
        console.error('Error fetching counseling schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail jadwal konseling',
            error: error.message
        });
    }
};

/**
 * Create new counseling schedule
 */
export const createCounselingSchedule = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            case_id,
            schedule_date,
            counselor_id,
            status
        } = req.body;

        // Validation
        if (!case_id || !schedule_date || !counselor_id) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Case ID, tanggal jadwal, dan Guru BK wajib diisi'
            });
        }

        // Check if counseling case belongs to the same school
        const counselingCase = await CounselingCase.findOne({
            where: {
                id: case_id,
                school_id: req.user.school_id
            },
            transaction
        });

        if (!counselingCase) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Kasus konseling tidak ditemukan atau tidak terdaftar di sekolah ini'
            });
        }

        // Check if counselor (teacher) exists
        const counselor = await Teacher.findOne({
            where: {
                id: counselor_id,
                school_id: req.user.school_id
            },
            transaction
        });

        if (!counselor) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Guru BK tidak ditemukan atau tidak terdaftar di sekolah ini'
            });
        }

        const schedule = await CounselingSchedule.create({
            school_id: req.user.school_id,
            case_id,
            schedule_date,
            counselor_id,
            status: status || 'UPCOMING'
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Jadwal konseling berhasil dibuat',
            data: schedule
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating counseling schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat jadwal konseling',
            error: error.message
        });
    }
};

/**
 * Update counseling schedule
 */
export const updateCounselingSchedule = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const {
            schedule_date,
            counselor_id,
            status
        } = req.body;

        const schedule = await CounselingSchedule.findOne({
            where: {
                id,
                school_id: req.user.school_id
            },
            transaction
        });

        if (!schedule) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Data jadwal konseling tidak ditemukan'
            });
        }

        // If counselor_id is being updated, verify it exists
        if (counselor_id) {
            const counselor = await Teacher.findOne({
                where: {
                    id: counselor_id,
                    school_id: req.user.school_id
                },
                transaction
            });

            if (!counselor) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Guru BK tidak ditemukan atau tidak terdaftar di sekolah ini'
                });
            }
        }

        await schedule.update({
            schedule_date: schedule_date || schedule.schedule_date,
            counselor_id: counselor_id || schedule.counselor_id,
            status: status || schedule.status
        }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Jadwal konseling berhasil diperbarui',
            data: schedule
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating counseling schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui jadwal konseling',
            error: error.message
        });
    }
};

/**
 * Delete counseling schedule
 */
export const deleteCounselingSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        const schedule = await CounselingSchedule.findOne({
            where: {
                id,
                school_id: req.user.school_id
            }
        });

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Data jadwal konseling tidak ditemukan'
            });
        }

        await schedule.destroy();

        res.json({
            success: true,
            message: 'Jadwal konseling berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting counseling schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus jadwal konseling',
            error: error.message
        });
    }
};

/**
 * Get counseling schedule statistics
 */
export const getCounselingScheduleStats = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        // Get overall statistics
        const stats = await CounselingSchedule.findAll({
            where: {
                school_id
            },
            attributes: [
                [
                    sequelize.fn('COUNT', sequelize.col('CounselingSchedule.id')),
                    'total'
                ],
                [
                    sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingSchedule.status = 'UPCOMING' THEN 1 END")),
                    'upcoming'
                ],
                [
                    sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingSchedule.status = 'DONE' THEN 1 END")),
                    'done'
                ],
                [
                    sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingSchedule.status = 'CANCELLED' THEN 1 END")),
                    'cancelled'
                ]
            ],
            raw: true
        });

        // Get schedules for this week
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const thisWeekCount = await CounselingSchedule.count({
            where: {
                school_id,
                schedule_date: {
                    [Op.gte]: weekAgo
                }
            }
        });

        res.json({
            success: true,
            data: {
                ...stats[0],
                this_week: thisWeekCount
            }
        });
    } catch (error) {
        console.error('Error fetching counseling schedule stats:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik jadwal konseling',
            error: error.message
        });
    }
};

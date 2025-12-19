import { CounselingCase, Student, Teacher } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

/**
 * Get counseling report with aggregated data
 */
export const getCounselingReport = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 25,
            start_date,
            end_date,
            category,
            level,
            status,
            counselor_id,
            class_id,
            source
        } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = {
            school_id: req.user.school_id
        };

        // Build filter conditions
        if (category) whereConditions.category = category;
        if (level) whereConditions.level = level;
        if (status) whereConditions.status = status;
        if (source) whereConditions.source = source;

        // Date range filter
        if (start_date && end_date) {
            whereConditions.created_at = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            whereConditions.created_at = {
                [Op.gte]: new Date(start_date)
            };
        } else if (end_date) {
            whereConditions.created_at = {
                [Op.lte]: new Date(end_date)
            };
        }

        // Student where conditions for class filter
        let studentWhere = {};
        if (class_id) {
            studentWhere.class_id = class_id;
        }

        // Build the query with aggregations
        const { count, rows } = await CounselingCase.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'nis', 'name', 'class_id'],
                    where: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
                    include: [
                        {
                            model: sequelize.models.ClassRoom,
                            as: 'class',
                            attributes: ['id', 'name'],
                            required: false
                        }
                    ]
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
              SELECT COUNT(*)
              FROM counseling_sessions
              WHERE counseling_sessions.case_id = CounselingCase.id
            )`),
                        'session_count'
                    ],
                    [
                        sequelize.literal(`(
              SELECT MAX(session_date)
              FROM counseling_sessions
              WHERE counseling_sessions.case_id = CounselingCase.id
            )`),
                        'last_session_date'
                    ],
                    [
                        sequelize.literal(`(
              SELECT teachers.name
              FROM counseling_sessions
              JOIN teachers ON counseling_sessions.counselor_id = teachers.id
              WHERE counseling_sessions.case_id = CounselingCase.id
              ORDER BY counseling_sessions.session_date DESC
              LIMIT 1
            )`),
                        'counselor_name'
                    ]
                ]
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            distinct: true,
            subQuery: false
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
        console.error('Error fetching counseling report:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil laporan konseling',
            error: error.message
        });
    }
};

/**
 * Export counseling report to Excel
 */
export const exportCounselingReportExcel = async (req, res) => {
    try {
        const {
            start_date,
            end_date,
            category,
            level,
            status,
            counselor_id,
            class_id,
            source
        } = req.query;

        const whereConditions = {
            school_id: req.user.school_id
        };

        // Build filter conditions (same as report)
        if (category) whereConditions.category = category;
        if (level) whereConditions.level = level;
        if (status) whereConditions.status = status;
        if (source) whereConditions.source = source;

        if (start_date && end_date) {
            whereConditions.created_at = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            whereConditions.created_at = {
                [Op.gte]: new Date(start_date)
            };
        } else if (end_date) {
            whereConditions.created_at = {
                [Op.lte]: new Date(end_date)
            };
        }

        let studentWhere = {};
        if (class_id) {
            studentWhere.class_id = class_id;
        }

        // Get all data without pagination for export
        const cases = await CounselingCase.findAll({
            where: whereConditions,
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'nis', 'name', 'class_id'],
                    where: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
                    include: [
                        {
                            model: sequelize.models.ClassRoom,
                            as: 'class',
                            attributes: ['id', 'name'],
                            required: false
                        }
                    ]
                }
            ],
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
              SELECT COUNT(*)
              FROM counseling_sessions
              WHERE counseling_sessions.case_id = CounselingCase.id
            )`),
                        'session_count'
                    ],
                    [
                        sequelize.literal(`(
              SELECT MAX(session_date)
              FROM counseling_sessions
              WHERE counseling_sessions.case_id = CounselingCase.id
            )`),
                        'last_session_date'
                    ],
                    [
                        sequelize.literal(`(
              SELECT teachers.name
              FROM counseling_sessions
              JOIN teachers ON counseling_sessions.counselor_id = teachers.id
              WHERE counseling_sessions.case_id = CounselingCase.id
              ORDER BY counseling_sessions.session_date DESC
              LIMIT 1
            )`),
                        'counselor_name'
                    ]
                ]
            },
            order: [['created_at', 'DESC']],
            subQuery: false
        });

        // Prepare data for Excel
        const excelData = cases.map((c, index) => ({
            'No': index + 1,
            'Nama Siswa': c.student?.name || '-',
            'NIS': c.student?.nis || '-',
            'Kelas': c.student?.class?.name || '-',
            'Judul Kasus': c.issue_title,
            'Kategori': c.category,
            'Level': c.level,
            'Sumber': c.source,
            'Status': c.status,
            'Jumlah Sesi': c.dataValues.session_count || 0,
            'Tanggal Dibuat': new Date(c.created_at).toLocaleDateString('id-ID'),
            'Konselor': c.dataValues.counselor_name || '-',
            'Sesi Terakhir': c.dataValues.last_session_date
                ? new Date(c.dataValues.last_session_date).toLocaleDateString('id-ID')
                : '-'
        }));

        // Simple CSV export (can be enhanced with exceljs library)
        const headers = Object.keys(excelData[0] || {});
        const csvContent = [
            headers.join(','),
            ...excelData.map(row => headers.map(h => `"${row[h]}"`).join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-konseling-${Date.now()}.csv`);
        res.send('\uFEFF' + csvContent); // UTF-8 BOM for Excel compatibility
    } catch (error) {
        console.error('Error exporting counseling report:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal export laporan konseling',
            error: error.message
        });
    }
};

/**
 * Export counseling report to PDF
 */
export const exportCounselingReportPDF = async (req, res) => {
    try {
        // For now, return a simple message
        // Can be implemented with pdfkit or puppeteer later
        res.status(501).json({
            success: false,
            message: 'Export PDF belum diimplementasikan. Gunakan export Excel terlebih dahulu.'
        });
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal export PDF',
            error: error.message
        });
    }
};

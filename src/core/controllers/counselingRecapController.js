import { CounselingCase, CounselingSession, CounselingFollowup, CounselingDocument, Student, Teacher, ClassRoom } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

/**
 * Counseling Recap Controller
 * Handle student counseling recap and statistics
 */

/**
 * Get student counseling summary statistics
 */
export const getStudentSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academic_year, status, category, level } = req.query;

        // Build filter conditions
        const whereConditions = { student_id: studentId };

        if (academic_year) whereConditions.academic_year = academic_year;
        if (status) whereConditions.status = status;
        if (category) whereConditions.category = category;
        if (level) whereConditions.level = level;

        // Get all cases for the student
        const cases = await CounselingCase.findAll({
            where: whereConditions,
            attributes: ['id', 'status', 'category', 'level']
        });

        // Calculate statistics
        const totalCases = cases.length;
        const activeCases = cases.filter(c => ['OPEN', 'IN_PROGRESS'].includes(c.status)).length;
        const resolvedCases = cases.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

        // Get total sessions count
        const caseIds = cases.map(c => c.id);
        const sessionsCount = await CounselingSession.count({
            where: { case_id: { [Op.in]: caseIds } }
        });

        // Get most frequent category
        const categoryCount = {};
        cases.forEach(c => {
            categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
        });
        const mostFrequentCategory = Object.keys(categoryCount).reduce((a, b) =>
            categoryCount[a] > categoryCount[b] ? a : b, null
        );

        // Get highest level
        const levelPriority = { 'RINGAN': 1, 'SEDANG': 2, 'BERAT': 3 };
        const highestLevel = cases.reduce((highest, c) => {
            if (!highest) return c.level;
            return levelPriority[c.level] > levelPriority[highest] ? c.level : highest;
        }, null);

        res.json({
            success: true,
            data: {
                total_cases: totalCases,
                active_cases: activeCases,
                resolved_cases: resolvedCases,
                total_sessions: sessionsCount,
                most_frequent_category: mostFrequentCategory,
                highest_level: highestLevel
            }
        });
    } catch (error) {
        console.error('Error fetching student summary:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil ringkasan konseling siswa',
            error: error.message
        });
    }
};

/**
 * Get student cases with filters and pagination
 */
export const getStudentCases = async (req, res) => {
    try {
        const { studentId } = req.params;
        const {
            page = 1,
            limit = 25,
            academic_year,
            status,
            category,
            level
        } = req.query;

        const offset = (page - 1) * limit;
        const whereConditions = { student_id: studentId };

        // Build filter conditions
        if (academic_year) whereConditions.academic_year = academic_year;
        if (status) whereConditions.status = status;
        if (category) whereConditions.category = category;
        if (level) whereConditions.level = level;

        const { count, rows } = await CounselingCase.findAndCountAll({
            where: whereConditions,
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'nis', 'name'],
                    include: [
                        {
                            model: ClassRoom,
                            as: 'class',
                            attributes: ['id', 'name']
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
                    ]
                ]
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
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
        console.error('Error fetching student cases:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil daftar kasus siswa',
            error: error.message
        });
    }
};

/**
 * Get complete case detail with sessions, followups, and documents
 */
export const getCaseDetail = async (req, res) => {
    try {
        const { caseId } = req.params;

        // Get case with student info
        const counselingCase = await CounselingCase.findOne({
            where: { id: caseId },
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ['id', 'nis', 'name', 'gender'],
                    include: [
                        {
                            model: ClassRoom,
                            as: 'class',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ]
        });

        if (!counselingCase) {
            return res.status(404).json({
                success: false,
                message: 'Kasus tidak ditemukan'
            });
        }

        // Get sessions separately
        const sessions = await CounselingSession.findAll({
            where: { case_id: caseId },
            include: [
                {
                    model: Teacher,
                    as: 'counselor',
                    attributes: ['id', 'name', 'nip']
                }
            ],
            order: [['session_date', 'DESC']]
        });

        // Get followups for all sessions
        const sessionIds = sessions.map(s => s.id);
        const followups = sessionIds.length > 0 ? await CounselingFollowup.findAll({
            where: { session_id: { [Op.in]: sessionIds } },
            include: [
                {
                    model: Teacher,
                    as: 'followup_teacher',
                    attributes: ['id', 'name', 'nip']
                },
                {
                    model: CounselingSession,
                    as: 'counseling_session',
                    attributes: ['id', 'session_date']
                }
            ],
            order: [['followup_date', 'DESC']]
        }) : [];

        // Get documents
        const documents = await CounselingDocument.findAll({
            where: { case_id: caseId },
            order: [['created_at', 'DESC']]
        });

        // Add sessions to case object
        const caseData = counselingCase.toJSON();
        caseData.counseling_sessions = sessions;

        res.json({
            success: true,
            data: {
                case: caseData,
                followups: followups,
                documents: documents
            }
        });
    } catch (error) {
        console.error('Error fetching case detail:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail kasus',
            error: error.message
        });
    }
};

/**
 * Get class counseling summary statistics
 */
export const getClassSummary = async (req, res) => {
    try {
        const { classId } = req.params;
        const { start_date, end_date, category, level, status } = req.query;

        // Build filter conditions (removed academic_year as it doesn't exist in CounselingCase)
        const whereConditions = {};

        if (category) whereConditions.category = category;
        if (level) whereConditions.level = level;
        if (status) whereConditions.status = status;

        if (start_date && end_date) {
            whereConditions.created_at = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        }

        // Get all students in class
        const allStudents = await Student.count({
            where: { class_id: classId }
        });

        // Get all cases for students in this class
        const studentIds = await Student.findAll({
            where: { class_id: classId },
            attributes: ['id']
        });

        const studentIdList = studentIds.map(s => s.id);

        const cases = await CounselingCase.findAll({
            where: {
                student_id: { [Op.in]: studentIdList },
                ...whereConditions
            },
            attributes: ['id', 'student_id', 'status', 'level']
        });

        // Calculate statistics
        const totalCases = cases.length;
        const uniqueStudents = new Set(cases.map(c => c.student_id)).size;
        const activeCases = cases.filter(c => ['OPEN', 'IN_PROGRESS'].includes(c.status)).length;
        const severeCases = cases.filter(c => c.level === 'BERAT').length;
        const avgCasesPerStudent = allStudents > 0 ? (totalCases / allStudents).toFixed(2) : 0;

        res.json({
            success: true,
            data: {
                total_students: allStudents,
                students_with_cases: uniqueStudents,
                total_cases: totalCases,
                active_cases: activeCases,
                severe_cases: severeCases,
                avg_cases_per_student: parseFloat(avgCasesPerStudent)
            }
        });
    } catch (error) {
        console.error('Error fetching class summary:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil ringkasan kelas',
            error: error.message
        });
    }
};

/**
 * Get class students with counseling recap
 */
export const getClassStudents = async (req, res) => {
    try {
        const { classId } = req.params;
        const {
            page = 1,
            limit = 100,
            start_date,
            end_date,
            category,
            level,
            status
        } = req.query;

        const offset = (page - 1) * limit;

        // Build case filter conditions (removed academic_year)
        const caseWhereConditions = {};

        if (category) caseWhereConditions.category = category;
        if (level) caseWhereConditions.level = level;
        if (status) caseWhereConditions.status = status;

        if (start_date && end_date) {
            caseWhereConditions.created_at = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        }

        // Get all students in class
        const students = await Student.findAll({
            where: { class_id: classId },
            attributes: ['id', 'nis', 'name'],
            order: [['name', 'ASC']]
        });

        // For each student, get their counseling statistics
        const studentRecaps = await Promise.all(students.map(async (student) => {
            const cases = await CounselingCase.findAll({
                where: {
                    student_id: student.id,
                    ...caseWhereConditions
                },
                attributes: ['id', 'status', 'level', 'updated_at'],
                order: [['updated_at', 'DESC']]
            });

            const totalCases = cases.length;
            const activeCases = cases.filter(c => ['OPEN', 'IN_PROGRESS'].includes(c.status)).length;
            const severeCases = cases.filter(c => c.level === 'BERAT').length;
            const latestStatus = cases.length > 0 ? cases[0].status : null;

            // Get total sessions for this student
            const caseIds = cases.map(c => c.id);
            const sessionsCount = caseIds.length > 0 ? await CounselingSession.count({
                where: { case_id: { [Op.in]: caseIds } }
            }) : 0;

            return {
                id: student.id,
                nis: student.nis,
                name: student.name,
                total_cases: totalCases,
                active_cases: activeCases,
                severe_cases: severeCases,
                total_sessions: sessionsCount,
                latest_status: latestStatus
            };
        }));

        // Sort by total cases descending
        studentRecaps.sort((a, b) => b.total_cases - a.total_cases);

        // Paginate
        const paginatedRecaps = studentRecaps.slice(offset, offset + parseInt(limit));

        res.json({
            success: true,
            data: paginatedRecaps,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: studentRecaps.length,
                totalPages: Math.ceil(studentRecaps.length / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching class students:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data siswa kelas',
            error: error.message
        });
    }
};

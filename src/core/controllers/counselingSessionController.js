import { CounselingSession, CounselingCase, Student, User, Teacher } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

/**
 * Counseling Session Controller
 * Handle CRUD operations untuk data sesi konseling
 */

/**
 * Get all counseling sessions with filters
 */
export const getCounselingSessions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      method,
      case_id,
      student_id,
      start_date,
      end_date
    } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = {};

    // Build filter conditions
    if (method) whereConditions.method = method;
    if (case_id) whereConditions.case_id = case_id;

    // If student_id is provided, filter by counseling cases
    let caseWhere = {};
    let studentWhere = {};
    if (student_id) {
      studentWhere.student_id = student_id;
    }

    // Date range filter
    if (start_date || end_date) {
      whereConditions.session_date = {};
      if (start_date) whereConditions.session_date[Op.gte] = new Date(start_date);
      if (end_date) whereConditions.session_date[Op.lte] = new Date(end_date);
    }

    // Include associations
    const include = [
      {
        model: CounselingCase,
        as: 'counseling_case',
        where: caseWhere,
        include: [
          {
            model: Student,
            as: 'student',
            where: studentWhere,
            attributes: ['id', 'nis', 'nisn', 'name', 'gender']
          }
        ],
        required: true
      },
      {
        model: Teacher,
        as: 'counselor',
        attributes: ['id', 'name', 'nip', 'position']
      }
    ];

    // Search functionality
    if (search) {
      whereConditions[Op.or] = [
        { notes: { [Op.like]: `%${search}%` } },
        { next_plan: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await CounselingSession.findAndCountAll({
      where: whereConditions,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['session_date', 'DESC']]
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
    console.error('Error fetching counseling sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data sesi konseling',
      error: error.message
    });
  }
};

/**
 * Get counseling session by ID
 */
export const getCounselingSessionById = async (req, res) => {
  try {
    const { id } = req.params;

    const counselingSession = await CounselingSession.findOne({
      where: { id },
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
        },
        {
          model: Teacher,
          as: 'counselor',
          attributes: ['id', 'name', 'nip', 'position']
        }
      ]
    });

    if (!counselingSession) {
      return res.status(404).json({
        success: false,
        message: 'Data sesi konseling tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: counselingSession
    });
  } catch (error) {
    console.error('Error fetching counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail sesi konseling',
      error: error.message
    });
  }
};

/**
 * Create new counseling session
 */
export const createCounselingSession = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      case_id,
      counselor_id,
      session_date,
      method,
      duration,
      notes,
      next_plan
    } = req.body;

    // Validation
    const missingFields = [];
    if (!case_id) missingFields.push('Kasus');
    if (!counselor_id) missingFields.push('Guru BK');
    if (!session_date) missingFields.push('Tanggal Sesi');
    if (!method) missingFields.push('Metode');
    if (!duration) missingFields.push('Durasi');

    if (missingFields.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Field berikut wajib diisi: ${missingFields.join(', ')}`
      });
    }

    // Check if counseling case exists
    const counselingCase = await CounselingCase.findOne({
      where: { id: case_id },
      transaction
    });

    if (!counselingCase) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Kasus konseling tidak ditemukan'
      });
    }

    const counselingSession = await CounselingSession.create({
      case_id,
      counselor_id,
      session_date,
      method,
      duration,
      notes,
      next_plan
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Data sesi konseling berhasil dibuat',
      data: counselingSession
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat data sesi konseling',
      error: error.message
    });
  }
};

/**
 * Update counseling session
 */
export const updateCounselingSession = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      counselor_id,
      session_date,
      method,
      duration,
      notes,
      next_plan
    } = req.body;

    const counselingSession = await CounselingSession.findOne({
      where: { id },
      transaction
    });

    if (!counselingSession) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Data sesi konseling tidak ditemukan'
      });
    }

    await counselingSession.update({
      counselor_id,
      session_date,
      method,
      duration,
      notes,
      next_plan
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Data sesi konseling berhasil diperbarui',
      data: counselingSession
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data sesi konseling',
      error: error.message
    });
  }
};

/**
 * Delete counseling session
 */
export const deleteCounselingSession = async (req, res) => {
  try {
    const { id } = req.params;

    const counselingSession = await CounselingSession.findOne({
      where: { id }
    });

    if (!counselingSession) {
      return res.status(404).json({
        success: false,
        message: 'Data sesi konseling tidak ditemukan'
      });
    }

    await counselingSession.destroy();

    res.json({
      success: true,
      message: 'Data sesi konseling berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting counseling session:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data sesi konseling',
      error: error.message
    });
  }
};

/**
 * Get counseling session statistics
 */
export const getCounselingSessionStats = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = {};
    if (start_date || end_date) {
      dateFilter = {};
      if (start_date) dateFilter[Op.gte] = new Date(start_date);
      if (end_date) dateFilter[Op.lte] = new Date(end_date);
    }

    // Get overall statistics
    const stats = await CounselingSession.findAll({
      where: dateFilter ? { session_date: dateFilter } : {},
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('CounselingSession.id')), 'total_sessions'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingSession.method = 'OFFLINE' THEN 1 END")), 'offline_sessions'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingSession.method = 'ONLINE' THEN 1 END")), 'online_sessions'],
        [sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingSession.method = 'CALL' THEN 1 END")), 'call_sessions'],
        [sequelize.fn('AVG', sequelize.col('CounselingSession.duration')), 'avg_duration']
      ],
      raw: true
    });

    // Get sessions by method
    const methodStats = await CounselingSession.findAll({
      where: dateFilter ? { session_date: dateFilter } : {},
      attributes: [
        'method',
        [sequelize.fn('COUNT', sequelize.col('CounselingSession.id')), 'count']
      ],
      group: ['method'],
      raw: true
    });

    // Get recent sessions
    const recentSessions = await CounselingSession.findAll({
      where: dateFilter ? { session_date: dateFilter } : {},
      include: [
        {
          model: CounselingCase,
          as: 'counseling_case',
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['id', 'nis', 'name']
            }
          ]
        },
        {
          model: Teacher,
          as: 'counselor',
          attributes: ['id', 'name', 'nip']
        }
      ],
      attributes: ['id', 'session_date', 'method', 'duration'],
      order: [['session_date', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        methodStats,
        recentSessions
      }
    });
  } catch (error) {
    console.error('Error fetching counseling session stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik sesi konseling',
      error: error.message
    });
  }
};
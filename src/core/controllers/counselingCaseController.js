import { CounselingCase, Student, User, School } from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../../config/database.js';

/**
 * Counseling Case Controller
 * Handle CRUD operations untuk data kasus konseling
 */

/**
 * Get all counseling cases with filters
 */
export const getCounselingCases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search,
      status,
      category,
      level,
      source,
      student_id,
      academic_year_id
    } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = {
      school_id: req.user.school_id
    };

    // Build filter conditions
    if (status) whereConditions.status = status;
    if (category) whereConditions.category = category;
    if (level) whereConditions.level = level;
    if (source) whereConditions.source = source;
    if (student_id) whereConditions.student_id = student_id;

    // If academic_year_id is provided, filter by students in that academic year
    let studentWhere = {};
    if (academic_year_id) {
      studentWhere.academic_year_id = academic_year_id;
    }

    // Include associations
    const include = [
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'nis', 'nisn', 'name', 'gender', 'class_id'],
        where: studentWhere,
        include: [
          {
            model: School,
            as: 'school',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'],
        required: false
      },
      {
        model: User,
        as: 'updater',
        attributes: ['id', 'name', 'email'],
        required: false
      }
    ];

    // Search functionality
    if (search) {
      whereConditions[Op.or] = [
        { issue_title: { [Op.like]: `%${search}%` } },
        { issue_description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await CounselingCase.findAndCountAll({
      where: whereConditions,
      include,
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
    console.error('Error fetching counseling cases:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kasus konseling',
      error: error.message
    });
  }
};

/**
 * Get counseling case by ID
 */
export const getCounselingCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const counselingCase = await CounselingCase.findOne({
      where: {
        id,
        school_id: req.user.school_id
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'nis', 'nisn', 'name', 'gender', 'photo'],
          include: [
            {
              model: School,
              as: 'school',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!counselingCase) {
      return res.status(404).json({
        success: false,
        message: 'Data kasus konseling tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: counselingCase
    });
  } catch (error) {
    console.error('Error fetching counseling case:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail kasus konseling',
      error: error.message
    });
  }
};

/**
 * Create new counseling case
 */
export const createCounselingCase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      student_id,
      source,
      issue_title,
      issue_description,
      category,
      level
    } = req.body;

    // Validation
    if (!student_id || !source || !issue_title || !issue_description || !category || !level) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib diisi'
      });
    }

    // Check if student belongs to the same school
    const student = await Student.findOne({
      where: {
        id: student_id,
        school_id: req.user.school_id
      },
      transaction
    });

    if (!student) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Siswa tidak ditemukan atau tidak terdaftar di sekolah ini'
      });
    }

    const counselingCase = await CounselingCase.create({
      school_id: req.user.school_id,
      student_id,
      source,
      issue_title,
      issue_description,
      category,
      level,
      status: 'OPEN',
      created_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Data kasus konseling berhasil dibuat',
      data: counselingCase
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating counseling case:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat data kasus konseling',
      error: error.message
    });
  }
};

/**
 * Update counseling case
 */
export const updateCounselingCase = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      source,
      issue_title,
      issue_description,
      category,
      level,
      status
    } = req.body;

    const counselingCase = await CounselingCase.findOne({
      where: {
        id,
        school_id: req.user.school_id
      },
      transaction
    });

    if (!counselingCase) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Data kasus konseling tidak ditemukan'
      });
    }

    await counselingCase.update({
      source,
      issue_title,
      issue_description,
      category,
      level,
      status,
      updated_by: req.user.id
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Data kasus konseling berhasil diperbarui',
      data: counselingCase
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating counseling case:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui data kasus konseling',
      error: error.message
    });
  }
};

/**
 * Delete counseling case
 */
export const deleteCounselingCase = async (req, res) => {
  try {
    const { id } = req.params;

    const counselingCase = await CounselingCase.findOne({
      where: {
        id,
        school_id: req.user.school_id
      }
    });

    if (!counselingCase) {
      return res.status(404).json({
        success: false,
        message: 'Data kasus konseling tidak ditemukan'
      });
    }

    await counselingCase.destroy();

    res.json({
      success: true,
      message: 'Data kasus konseling berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting counseling case:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus data kasus konseling',
      error: error.message
    });
  }
};

/**
 * Get counseling case statistics
 */
export const getCounselingCaseStats = async (req, res) => {
  try {
    const { academic_year_id } = req.query;
    const school_id = req.user.school_id;

    let studentWhere = {};
    if (academic_year_id) {
      studentWhere.academic_year_id = academic_year_id;
    }

    // Get overall statistics
    const stats = await CounselingCase.findAll({
      where: {
        school_id
      },
      include: [
        {
          model: Student,
          as: 'student',
          where: studentWhere,
          attributes: []
        }
      ],
      attributes: [
        [
          sequelize.fn('COUNT', sequelize.col('CounselingCase.id')),
          'total_cases'
        ],
        [
          sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingCase.status = 'OPEN' THEN 1 END")),
          'open_cases'
        ],
        [
          sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingCase.status = 'IN_PROGRESS' THEN 1 END")),
          'in_progress_cases'
        ],
        [
          sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingCase.status = 'WAITING_PARENT' THEN 1 END")),
          'waiting_parent_cases'
        ],
        [
          sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingCase.status = 'RESOLVED' THEN 1 END")),
          'resolved_cases'
        ],
        [
          sequelize.fn('COUNT', sequelize.literal("CASE WHEN CounselingCase.status = 'CLOSED' THEN 1 END")),
          'closed_cases'
        ]
      ],
      raw: true
    });

    // Get cases by category
    const categoryStats = await CounselingCase.findAll({
      where: {
        school_id
      },
      include: [
        {
          model: Student,
          as: 'student',
          where: studentWhere,
          attributes: []
        }
      ],
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('CounselingCase.id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    // Get cases by level
    const levelStats = await CounselingCase.findAll({
      where: {
        school_id
      },
      include: [
        {
          model: Student,
          as: 'student',
          where: studentWhere,
          attributes: []
        }
      ],
      attributes: [
        'level',
        [sequelize.fn('COUNT', sequelize.col('CounselingCase.id')), 'count']
      ],
      group: ['level'],
      raw: true
    });

    // Get recent cases
    const recentCases = await CounselingCase.findAll({
      where: {
        school_id
      },
      include: [
        {
          model: Student,
          as: 'student',
          where: studentWhere,
          attributes: ['id', 'nis', 'name']
        }
      ],
      attributes: ['id', 'issue_title', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        categoryStats,
        levelStats,
        recentCases
      }
    });
  } catch (error) {
    console.error('Error fetching counseling case stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik kasus konseling',
      error: error.message
    });
  }
};
import { 
  ViolationLevel, 
  ViolationType, 
  ViolationAction, 
  StudentViolation,
  School,
  Student,
  User,
  Grade,
  ClassRoom
} from "../models/index.js";
import { uploadFile, deleteFile } from "../../config/minio.js";
import { Op } from "sequelize";

// ==================== VIOLATION LEVELS ====================

// Get all violation levels
export const getAllViolationLevels = async (req, res) => {
  try {
    const { school_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: levels } = await ViolationLevel.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['min_point', 'ASC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: levels,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get violation level by ID
export const getViolationLevelById = async (req, res) => {
  try {
    const level = await ViolationLevel.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
      ],
    });
    if (!level) {
      return res.status(404).json({ message: "Violation level not found" });
    }
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create violation level
export const createViolationLevel = async (req, res) => {
  try {
    const { school_id, name, min_point, max_point, description } = req.body;

    const level = await ViolationLevel.create({
      school_id,
      name,
      min_point,
      max_point,
      description,
    });
    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update violation level
export const updateViolationLevel = async (req, res) => {
  try {
    const { school_id, name, min_point, max_point, description } = req.body;

    const level = await ViolationLevel.findByPk(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "Violation level not found" });
    }

    await level.update({
      school_id,
      name,
      min_point,
      max_point,
      description,
      updated_at: new Date(),
    });
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete violation level
export const deleteViolationLevel = async (req, res) => {
  try {
    const level = await ViolationLevel.findByPk(req.params.id);
    if (!level) {
      return res.status(404).json({ message: "Violation level not found" });
    }

    await level.destroy();
    res.json({ message: "Violation level deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== VIOLATION TYPES ====================

// Get all violation types
export const getAllViolationTypes = async (req, res) => {
  try {
    const { school_id, level_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;
    if (level_id) where.level_id = level_id;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: types } = await ViolationType.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: ViolationLevel,
          as: "level",
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['point', 'ASC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: types,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get violation type by ID
export const getViolationTypeById = async (req, res) => {
  try {
    const type = await ViolationType.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: ViolationLevel,
          as: "level",
        },
      ],
    });
    if (!type) {
      return res.status(404).json({ message: "Violation type not found" });
    }
    res.json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create violation type
export const createViolationType = async (req, res) => {
  try {
    const { school_id, level_id, name, point, description } = req.body;

    const type = await ViolationType.create({
      school_id,
      level_id,
      name,
      point,
      description,
    });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update violation type
export const updateViolationType = async (req, res) => {
  try {
    const { school_id, level_id, name, point, description } = req.body;

    const type = await ViolationType.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: "Violation type not found" });
    }

    await type.update({
      school_id,
      level_id,
      name,
      point,
      description,
      updated_at: new Date(),
    });
    res.json(type);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete violation type
export const deleteViolationType = async (req, res) => {
  try {
    const type = await ViolationType.findByPk(req.params.id);
    if (!type) {
      return res.status(404).json({ message: "Violation type not found" });
    }

    await type.destroy();
    res.json({ message: "Violation type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== VIOLATION ACTIONS ====================

// Get all violation actions
export const getAllViolationActions = async (req, res) => {
  try {
    const { school_id, level_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;
    if (level_id) where.level_id = level_id;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: actions } = await ViolationAction.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: ViolationLevel,
          as: "level",
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['action_name', 'ASC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: actions,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get violation action by ID
export const getViolationActionById = async (req, res) => {
  try {
    const action = await ViolationAction.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: ViolationLevel,
          as: "level",
        },
      ],
    });
    if (!action) {
      return res.status(404).json({ message: "Violation action not found" });
    }
    res.json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create violation action
export const createViolationAction = async (req, res) => {
  try {
    const { school_id, level_id, action_name, description } = req.body;

    const action = await ViolationAction.create({
      school_id,
      level_id,
      action_name,
      description,
    });
    res.status(201).json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update violation action
export const updateViolationAction = async (req, res) => {
  try {
    const { school_id, level_id, action_name, description } = req.body;

    const action = await ViolationAction.findByPk(req.params.id);
    if (!action) {
      return res.status(404).json({ message: "Violation action not found" });
    }

    await action.update({
      school_id,
      level_id,
      action_name,
      description,
      updated_at: new Date(),
    });
    res.json(action);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete violation action
export const deleteViolationAction = async (req, res) => {
  try {
    const action = await ViolationAction.findByPk(req.params.id);
    if (!action) {
      return res.status(404).json({ message: "Violation action not found" });
    }

    await action.destroy();
    res.json({ message: "Violation action deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== STUDENT VIOLATIONS ====================

// Get all student violations
export const getAllStudentViolations = async (req, res) => {
  try {
    const { student_id, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (student_id) where.student_id = student_id;
    if (status) where.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: violations } = await StudentViolation.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          include: [
            {
              model: Grade,
              as: "grade",
            },
            {
              model: ClassRoom,
              as: "class",
            },
          ],
        },
        {
          model: ViolationType,
          as: "type",
          include: [
            {
              model: ViolationLevel,
              as: "level",
            },
          ],
        },
        {
          model: ViolationAction,
          as: "action",
        },
        {
          model: User,
          as: "creator",
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: "approver",
          attributes: ['id', 'name'],
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['date', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: violations,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student violation by ID
export const getStudentViolationById = async (req, res) => {
  try {
    const violation = await StudentViolation.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            {
              model: Grade,
              as: "grade",
            },
            {
              model: ClassRoom,
              as: "class",
            },
          ],
        },
        {
          model: ViolationType,
          as: "type",
          include: [
            {
              model: ViolationLevel,
              as: "level",
            },
          ],
        },
        {
          model: ViolationAction,
          as: "action",
        },
        {
          model: User,
          as: "creator",
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: "approver",
          attributes: ['id', 'name'],
        },
      ],
    });
    if (!violation) {
      return res.status(404).json({ message: "Student violation not found" });
    }
    res.json(violation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create student violation
export const createStudentViolation = async (req, res) => {
  try {
    const { 
      student_id, 
      type_id, 
      action_id,
      date, 
      location, 
      description,
      status = 'NEW'
    } = req.body;

    // Debug logging
    console.log('Creating violation - req.user:', req.user);
    console.log('Authorization header:', req.headers.authorization);

    // Always use authenticated user ID, ignore any created_by from request body
    if (!req.user || !req.user.user_id) {
      console.log('ERROR: User not authenticated', { user: req.user });
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const violation = await StudentViolation.create({
      student_id,
      type_id,
      action_id,
      date,
      location,
      description,
      status,
      created_by: req.user.user_id, // Always use authenticated user
    });
    res.status(201).json(violation);
  } catch (error) {
    console.error('Error creating violation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update student violation
export const updateStudentViolation = async (req, res) => {
  try {
    const { 
      student_id, 
      type_id, 
      action_id,
      date, 
      location, 
      description,
      status
    } = req.body;

    const violation = await StudentViolation.findByPk(req.params.id);
    if (!violation) {
      return res.status(404).json({ message: "Student violation not found" });
    }

    await violation.update({
      student_id,
      type_id,
      action_id,
      date,
      location,
      description,
      status,
      updated_at: new Date(),
    });
    res.json(violation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve/reject violation
export const approveStudentViolation = async (req, res) => {
  try {
    const { status, action_id } = req.body; // status: APPROVED or REJECTED

    const violation = await StudentViolation.findByPk(req.params.id);
    if (!violation) {
      return res.status(404).json({ message: "Student violation not found" });
    }

    const approved_by = req.user.id; // From auth middleware

    await violation.update({
      status,
      action_id,
      approved_by,
      updated_at: new Date(),
    });
    res.json(violation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload evidence file
export const uploadViolationEvidence = async (req, res) => {
  try {
    const violation = await StudentViolation.findByPk(req.params.id);
    if (!violation) {
      return res.status(404).json({ message: "Student violation not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Delete old evidence if exists
    if (violation.evidence_file) {
      try {
        const oldKey = violation.evidence_file.split('/').pop();
        await deleteFile(`violations/${oldKey}`);
      } catch (error) {
        console.error("Failed to delete old evidence:", error);
      }
    }

    // Upload new evidence to MinIO
    const { key, url } = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `violations`
    );

    // Update violation record with evidence file
    await violation.update({
      evidence_file: url,
      updated_at: new Date(),
    });

    res.json({
      message: "Evidence uploaded successfully",
      evidence_file: url,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student violation
export const deleteStudentViolation = async (req, res) => {
  try {
    const violation = await StudentViolation.findByPk(req.params.id);
    if (!violation) {
      return res.status(404).json({ message: "Student violation not found" });
    }

    // Delete evidence file from MinIO if exists
    if (violation.evidence_file) {
      try {
        const key = violation.evidence_file.split('/').pop();
        await deleteFile(`violations/${key}`);
      } catch (error) {
        console.error("Failed to delete evidence from MinIO:", error);
      }
    }

    await violation.destroy();
    res.json({ message: "Student violation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get violation statistics by student
export const getViolationStatsByStudent = async (req, res) => {
  try {
    const { student_id } = req.params;

    const violations = await StudentViolation.findAll({
      where: { student_id },
      include: [
        {
          model: ViolationType,
          as: "type",
          attributes: ['point'],
        },
      ],
    });

    const totalPoints = violations.reduce((sum, v) => sum + (v.type?.point || 0), 0);
    const totalViolations = violations.length;
    
    const statusCounts = {
      NEW: violations.filter(v => v.status === 'NEW').length,
      APPROVED: violations.filter(v => v.status === 'APPROVED').length,
      REJECTED: violations.filter(v => v.status === 'REJECTED').length,
      ACTIONED: violations.filter(v => v.status === 'ACTIONED').length,
    };

    res.json({
      student_id,
      total_points: totalPoints,
      total_violations: totalViolations,
      status_counts: statusCounts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

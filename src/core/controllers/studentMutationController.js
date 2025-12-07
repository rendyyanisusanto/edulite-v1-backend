import { StudentMutation, Student, School, User } from "../models/index.js";

// Get all student mutations
export const getAllStudentMutations = async (req, res) => {
  try {
    const { school_id, student_id, type, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;
    if (student_id) where.student_id = student_id;
    if (type) where.type = type;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: mutations } = await StudentMutation.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
        },
        {
          model: School,
          as: "school",
        },
        {
          model: User,
          as: "creator",
          attributes: { exclude: ["password_hash"] },
        },
      ],
      order: [["date", "DESC"], ["created_at", "DESC"]],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: mutations,
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

// Get student mutation by ID
export const getStudentMutationById = async (req, res) => {
  try {
    const mutation = await StudentMutation.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: "student",
        },
        {
          model: School,
          as: "school",
        },
        {
          model: User,
          as: "creator",
          attributes: { exclude: ["password_hash"] },
        },
      ],
    });
    if (!mutation) {
      return res.status(404).json({ message: "Student mutation not found" });
    }
    res.json(mutation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create student mutation
export const createStudentMutation = async (req, res) => {
  try {
    const {
      student_id,
      school_id,
      type,
      from_school,
      to_school,
      reason,
      date,
      created_by,
    } = req.body;

    // Validate type
    const validTypes = ["MASUK", "PINDAH", "KELUAR"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const mutation = await StudentMutation.create({
      student_id,
      school_id,
      type,
      from_school,
      to_school,
      reason,
      date,
      created_by,
    });

    res.status(201).json(mutation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student mutation
export const updateStudentMutation = async (req, res) => {
  try {
    const {
      student_id,
      school_id,
      type,
      from_school,
      to_school,
      reason,
      date,
    } = req.body;

    const mutation = await StudentMutation.findByPk(req.params.id);
    if (!mutation) {
      return res.status(404).json({ message: "Student mutation not found" });
    }

    // Validate type if provided
    if (type) {
      const validTypes = ["MASUK", "PINDAH", "KELUAR"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        });
      }
    }

    await mutation.update({
      student_id,
      school_id,
      type,
      from_school,
      to_school,
      reason,
      date,
    });

    res.json(mutation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student mutation
export const deleteStudentMutation = async (req, res) => {
  try {
    const mutation = await StudentMutation.findByPk(req.params.id);
    if (!mutation) {
      return res.status(404).json({ message: "Student mutation not found" });
    }
    await mutation.destroy();
    res.json({ message: "Student mutation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

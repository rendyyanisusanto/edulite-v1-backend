import { Teacher, School } from "../models/index.js";

// Get all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const { school_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: teachers } = await Teacher.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: teachers,
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

// Get teacher by ID
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
      ],
    });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create teacher
export const createTeacher = async (req, res) => {
  try {
    const { school_id, name, nip, position, subject } = req.body;

    const teacher = await Teacher.create({
      school_id,
      name,
      nip,
      position,
      subject,
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update teacher
export const updateTeacher = async (req, res) => {
  try {
    const { school_id,name, nip, position, subject } = req.body;
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await teacher.update({
      school_id,
      nip,
      name,
      position,
      subject,
      updated_at: new Date(),
    });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    await teacher.destroy();
    res.json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

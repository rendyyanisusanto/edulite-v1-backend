import { Grade, School, ClassRoom } from "../models/index.js";

// Get all grades
export const getAllGrades = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const where = { school_id: req.user.school_id };

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: grades } = await Grade.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      order: [["level", "ASC"]],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: grades,
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

// Get grade by ID
export const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: ClassRoom,
          as: "classes",
        },
      ],
    });
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create grade
export const createGrade = async (req, res) => {
  try {
    const { school_id, name, level } = req.body;
    const grade = await Grade.create({
      school_id,
      name,
      level,
    });
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update grade
export const updateGrade = async (req, res) => {
  try {
    const { school_id, name, level } = req.body;
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }
    await grade.update({
      school_id,
      name,
      level,
      updated_at: new Date(),
    });
    res.json(grade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete grade
export const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: "Grade not found" });
    }
    await grade.destroy();
    res.json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

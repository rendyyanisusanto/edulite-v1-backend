import { ClassRoom, School, Grade, Department, Teacher, User } from "../models/index.js";

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const where = { school_id: req.user.school_id };

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: classes } = await ClassRoom.findAndCountAll({
      where,
      include: [
        { model: School, as: "school" },
        { model: Grade, as: "grade" },
        { model: Department, as: "department" }
      ],
      order: [["grade_id", "ASC"], ["name", "ASC"]],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: classes,
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

// Get class by ID
export const getClassById = async (req, res) => {
  try {
    const classData = await ClassRoom.findByPk(req.params.id, {
      include: [
        { model: School, as: "school" },
        { model: Grade, as: "grade" },
        { model: Department, as: "department" }
      ],
    });
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create class
export const createClass = async (req, res) => {
  try {
    const { school_id, grade_id, department_id, name, capacity } = req.body;
    const classData = await ClassRoom.create({ school_id, grade_id, department_id, name, capacity });
    res.status(201).json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update class
export const updateClass = async (req, res) => {
  try {
    const { school_id, grade_id, department_id, name, capacity } = req.body;
    const classData = await ClassRoom.findByPk(req.params.id);
    if (!classData) return res.status(404).json({ message: "Class not found" });
    await classData.update({ school_id, grade_id, department_id, name, capacity, updated_at: new Date() });
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const classData = await ClassRoom.findByPk(req.params.id);
    if (!classData) return res.status(404).json({ message: "Class not found" });
    await classData.destroy();
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

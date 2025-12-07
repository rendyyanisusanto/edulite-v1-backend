import { Department, School, ClassRoom } from "../models/index.js";

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const { school_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: departments } = await Department.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      order: [["name", "ASC"]],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: departments,
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

// Get department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id, {
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
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create department
export const createDepartment = async (req, res) => {
  try {
    const { school_id, name, code, description } = req.body;
    const department = await Department.create({
      school_id,
      name,
      code,
      description,
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { school_id, name, code, description } = req.body;
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    await department.update({
      school_id,
      name,
      code,
      description,
      updated_at: new Date(),
    });
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    await department.destroy();
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

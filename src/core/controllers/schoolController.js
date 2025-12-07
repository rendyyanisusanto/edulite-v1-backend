import { School, User, SchoolApp } from "../models/index.js";

// Get all schools
export const getAllSchools = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: schools } = await School.findAndCountAll({
      include: [
        {
          model: SchoolApp,
          as: "apps",
        },
      ],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: schools,
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

// Get school by ID
export const getSchoolById = async (req, res) => {
  try {
    const school = await School.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "users",
        },
        {
          model: SchoolApp,
          as: "apps",
        },
      ],
    });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create school
export const createSchool = async (req, res) => {
  try {
    const { code, name, domain, address, phone, logo, status } = req.body;
    const school = await School.create({
      code,
      name,
      domain,
      address,
      phone,
      logo,
      status: status || "ACTIVE",
    });
    res.status(201).json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update school
export const updateSchool = async (req, res) => {
  try {
    const { code, name, domain, address, phone, logo, status } = req.body;
    const school = await School.findByPk(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    await school.update({
      code,
      name,
      domain,
      address,
      phone,
      logo,
      status,
      updated_at: new Date(),
    });
    res.json(school);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete school
export const deleteSchool = async (req, res) => {
  try {
    const school = await School.findByPk(req.params.id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }
    await school.destroy();
    res.json({ message: "School deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

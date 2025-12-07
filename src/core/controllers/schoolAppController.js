import { SchoolApp, School, App } from "../models/index.js";

// Get all school apps
export const getAllSchoolApps = async (req, res) => {
  try {
    const { school_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: schoolApps } = await SchoolApp.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: App,
          as: "app",
        },
      ],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: schoolApps,
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

// Get school app by ID
export const getSchoolAppById = async (req, res) => {
  try {
    const schoolApp = await SchoolApp.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: App,
          as: "app",
        },
      ],
    });
    if (!schoolApp) {
      return res.status(404).json({ message: "School App not found" });
    }
    res.json(schoolApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create school app (activate app for school)
export const createSchoolApp = async (req, res) => {
  try {
    const { school_id, app_id, status } = req.body;
    const schoolApp = await SchoolApp.create({
      school_id,
      app_id,
      status: status || "ACTIVE",
    });
    res.status(201).json(schoolApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update school app
export const updateSchoolApp = async (req, res) => {
  try {
    const { school_id, app_id, status } = req.body;
    const schoolApp = await SchoolApp.findByPk(req.params.id);
    if (!schoolApp) {
      return res.status(404).json({ message: "School App not found" });
    }
    await schoolApp.update({
      school_id,
      app_id,
      status,
      updated_at: new Date(),
    });
    res.json(schoolApp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete school app
export const deleteSchoolApp = async (req, res) => {
  try {
    const schoolApp = await SchoolApp.findByPk(req.params.id);
    if (!schoolApp) {
      return res.status(404).json({ message: "School App not found" });
    }
    await schoolApp.destroy();
    res.json({ message: "School App deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

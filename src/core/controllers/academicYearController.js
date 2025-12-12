import { AcademicYear, School } from "../models/index.js";

// Get all academic years
export const getAllAcademicYears = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const where = { school_id: req.user.school_id };

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: academicYears } = await AcademicYear.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      order: [["start_date", "DESC"]],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: academicYears,
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

// Get academic year by ID
export const getAcademicYearById = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
      ],
    });
    if (!academicYear) {
      return res.status(404).json({ message: "Academic year not found" });
    }
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active academic year for a school
export const getActiveAcademicYear = async (req, res) => {
  try {
    const { school_id } = req.params;
    const academicYear = await AcademicYear.findOne({
      where: {
        school_id,
        is_active: true,
      },
      include: [
        {
          model: School,
          as: "school",
        },
      ],
    });
    if (!academicYear) {
      return res.status(404).json({ message: "No active academic year found" });
    }
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create academic year
export const createAcademicYear = async (req, res) => {
  try {
    const { school_id, name, start_date, end_date, is_active } = req.body;

    // If setting as active, deactivate other academic years for this school
    if (is_active) {
      await AcademicYear.update(
        { is_active: false },
        { where: { school_id } }
      );
    }

    const academicYear = await AcademicYear.create({
      school_id,
      name,
      start_date,
      end_date,
      is_active: is_active || false,
    });
    res.status(201).json(academicYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update academic year
export const updateAcademicYear = async (req, res) => {
  try {
    const { school_id, name, start_date, end_date, is_active } = req.body;
    const academicYear = await AcademicYear.findByPk(req.params.id);
    if (!academicYear) {
      return res.status(404).json({ message: "Academic year not found" });
    }

    // If setting as active, deactivate other academic years for this school
    if (is_active && !academicYear.is_active) {
      await AcademicYear.update(
        { is_active: false },
        { where: { school_id: academicYear.school_id } }
      );
    }

    await academicYear.update({
      school_id,
      name,
      start_date,
      end_date,
      is_active,
      updated_at: new Date(),
    });
    res.json(academicYear);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete academic year
export const deleteAcademicYear = async (req, res) => {
  try {
    const academicYear = await AcademicYear.findByPk(req.params.id);
    if (!academicYear) {
      return res.status(404).json({ message: "Academic year not found" });
    }
    await academicYear.destroy();
    res.json({ message: "Academic year deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

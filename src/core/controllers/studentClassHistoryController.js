import { StudentClassHistory, Student, School, AcademicYear, Grade, ClassRoom, User } from "../models/index.js";

// Get all student class history
export const getAllStudentClassHistory = async (req, res) => {
  try {
    const { school_id, student_id, academic_year_id, grade_id, class_id, assignment_type, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;
    if (student_id) where.student_id = student_id;
    if (academic_year_id) where.academic_year_id = academic_year_id;
    if (grade_id) where.grade_id = grade_id;
    if (class_id) where.class_id = class_id;
    if (assignment_type) where.assignment_type = assignment_type;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: history } = await StudentClassHistory.findAndCountAll({
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
          model: AcademicYear,
          as: "academicYear",
        },
        {
          model: Grade,
          as: "grade",
        },
        {
          model: ClassRoom,
          as: "class",
        },
        {
          model: User,
          as: "assignedBy",
          attributes: { exclude: ["password_hash"] },
        },
      ],
      order: [["created_at", "DESC"]],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: history,
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

// Get student class history by ID
export const getStudentClassHistoryById = async (req, res) => {
  try {
    const history = await StudentClassHistory.findByPk(req.params.id, {
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
          model: AcademicYear,
          as: "academicYear",
        },
        {
          model: Grade,
          as: "grade",
        },
        {
          model: ClassRoom,
          as: "class",
        },
        {
          model: User,
          as: "assignedBy",
          attributes: { exclude: ["password_hash"] },
        },
      ],
    });
    if (!history) {
      return res.status(404).json({ message: "Student class history not found" });
    }
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create student class history
export const createStudentClassHistory = async (req, res) => {
  try {
    const {
      student_id,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      assigned_by,
      assignment_type,
    } = req.body;

    // Validate assignment_type
    const validTypes = ["AUTO", "MANUAL"];
    if (!validTypes.includes(assignment_type)) {
      return res.status(400).json({
        message: `Invalid assignment_type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const history = await StudentClassHistory.create({
      student_id,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      assigned_by,
      assignment_type,
    });

    res.status(201).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student class history
export const updateStudentClassHistory = async (req, res) => {
  try {
    const {
      student_id,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      assigned_by,
      assignment_type,
    } = req.body;

    const history = await StudentClassHistory.findByPk(req.params.id);
    if (!history) {
      return res.status(404).json({ message: "Student class history not found" });
    }

    // Validate assignment_type if provided
    if (assignment_type) {
      const validTypes = ["AUTO", "MANUAL"];
      if (!validTypes.includes(assignment_type)) {
        return res.status(400).json({
          message: `Invalid assignment_type. Must be one of: ${validTypes.join(", ")}`,
        });
      }
    }

    await history.update({
      student_id,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      assigned_by,
      assignment_type,
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student class history
export const deleteStudentClassHistory = async (req, res) => {
  try {
    const history = await StudentClassHistory.findByPk(req.params.id);
    if (!history) {
      return res.status(404).json({ message: "Student class history not found" });
    }
    await history.destroy();
    res.json({ message: "Student class history deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk assign students to class
export const bulkAssignStudentsToClass = async (req, res) => {
  try {
    const {
      student_ids,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      assigned_by,
      assignment_type = "MANUAL",
    } = req.body;

    // Validate inputs
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ message: "student_ids must be a non-empty array" });
    }

    const validTypes = ["AUTO", "MANUAL"];
    if (!validTypes.includes(assignment_type)) {
      return res.status(400).json({
        message: `Invalid assignment_type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Create bulk assignments
    const assignments = student_ids.map((student_id) => ({
      student_id,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      assigned_by,
      assignment_type,
    }));

    const createdRecords = await StudentClassHistory.bulkCreate(assignments);

    res.status(201).json({
      message: `Successfully assigned ${createdRecords.length} students to class`,
      data: createdRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

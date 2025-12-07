import { Student, School, AcademicYear, Grade, ClassRoom, Department } from "../models/index.js";
import { uploadFile, deleteFile, extractKeyFromUrl } from "../../config/minio.js";

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const { school_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: students } = await Student.findAndCountAll({
      where,
      include: [
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
          model: Department,
          as: "department",
        },
      ],
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: students,
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

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
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
          model: Department,
          as: "department",
        },
      ],
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create student
export const createStudent = async (req, res) => {
  try {
    const { 
      name,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      department_id,
      nis,
      nisn,
      date_of_birth,
      gender,
      address,
      parent_name,
      parent_phone,
    } = req.body;

    const student = await Student.create({
      name,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      department_id,
      nis,
      nisn,
      date_of_birth,
      gender,
      address,
      parent_name,
      parent_phone,
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { 
      name,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      department_id,
      nis,
      nisn,
      date_of_birth,
      gender,
      address,
      parent_name,
      parent_phone
    } = req.body;

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.update({
      name,
      school_id,
      academic_year_id,
      grade_id,
      class_id,
      department_id,
      nis,
      nisn,
      date_of_birth,
      gender,
      address,
      parent_name,
      parent_phone,
      updated_at: new Date(),
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Delete photo from MinIO if exists
    if (student.photo_key) {
      try {
        await deleteFile(student.photo_key);
      } catch (error) {
        console.error("Failed to delete photo from MinIO:", error);
        // Continue deleting student even if photo deletion fails
      }
    }

    await student.destroy();
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload student photo
export const uploadStudentPhoto = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Delete old photo if exists
    if (student.photo_key) {
      try {
        await deleteFile(student.photo_key);
      } catch (error) {
        console.error("Failed to delete old photo:", error);
        // Continue with upload even if old photo deletion fails
      }
    }

    // Upload new photo to MinIO
    const { key, url } = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `students/${student.school_id}`
    );

    // Update student record with photo info
    await student.update({
      photo: url,
      photo_key: key,
      updated_at: new Date(),
    });

    res.json({
      message: "Photo uploaded successfully",
      photo: url,
      photo_key: key,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete student photo
export const deleteStudentPhoto = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.photo_key) {
      return res.status(404).json({ message: "Student has no photo" });
    }

    // Delete photo from MinIO
    await deleteFile(student.photo_key);

    // Update student record
    await student.update({
      photo: null,
      photo_key: null,
      updated_at: new Date(),
    });

    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

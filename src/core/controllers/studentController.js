import { Student, School, AcademicYear, Grade, ClassRoom, Department, CardTemplate } from "../models/index.js";
import { uploadFile, deleteFile, extractKeyFromUrl } from "../../config/minio.js";
import { Op } from "sequelize";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import bwipjs from "bwip-js";

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

// Search students
export const searchStudents = async (req, res) => {
  try {
    const { school_id, search = '', limit = 20 } = req.query;
    
    const where = {};
    if (school_id) where.school_id = school_id;
    
    // Add search conditions
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { nis: { [Op.like]: `%${search}%` } },
        { nisn: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const students = await Student.findAll({
      where,
      attributes: ['id', 'name', 'nis', 'nisn', 'grade_id', 'class_id'],
      include: [
        {
          model: Grade,
          as: "grade",
          attributes: ['id', 'name']
        },
        {
          model: ClassRoom,
          as: "class",
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });
    
    res.json({ data: students });
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

// Import students from Excel
export const importStudentsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const results = {
      success: [],
      errors: [],
      total: data.length,
    };

    // Process each row with batch insert for performance
    const studentsToCreate = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (accounting for header)

      try {
        // Validate required fields
        if (!row.name || !row.school_id) {
          results.errors.push({
            row: rowNum,
            data: row,
            error: "Missing required fields: name and school_id are required",
          });
          continue;
        }

        // Prepare student data
        const studentData = {
          name: row.name,
          school_id: parseInt(row.school_id),
          academic_year_id: row.academic_year_id ? parseInt(row.academic_year_id) : null,
          grade_id: row.grade_id ? parseInt(row.grade_id) : null,
          class_id: row.class_id ? parseInt(row.class_id) : null,
          department_id: row.department_id ? parseInt(row.department_id) : null,
          nis: row.nis || null,
          nisn: row.nisn || null,
          date_of_birth: row.date_of_birth || null,
          gender: row.gender || null,
          address: row.address || null,
          parent_name: row.parent_name || null,
          parent_phone: row.parent_phone || null,
        };

        studentsToCreate.push(studentData);
        results.success.push({
          row: rowNum,
          data: studentData,
        });
      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: row,
          error: error.message,
        });
      }
    }

    // Bulk create students for better performance
    let createdStudents = [];
    if (studentsToCreate.length > 0) {
      try {
        createdStudents = await Student.bulkCreate(studentsToCreate, {
          validate: true,
          individualHooks: false, // Disable for better performance
        });
      } catch (error) {
        // Provide more helpful error messages
        let errorMessage = error.message;
        
        if (error.message.includes('school_id')) {
          errorMessage = "Invalid school_id. Please make sure the school_id exists in your system.";
        } else if (error.message.includes('academic_year_id')) {
          errorMessage = "Invalid academic_year_id. Please check the academic year ID.";
        } else if (error.message.includes('grade_id')) {
          errorMessage = "Invalid grade_id. Please check the grade ID.";
        } else if (error.message.includes('class_id')) {
          errorMessage = "Invalid class_id. Please check the class ID.";
        } else if (error.message.includes('department_id')) {
          errorMessage = "Invalid department_id. Please check the department ID.";
        }
        
        return res.status(400).json({
          message: "Failed to import students",
          error: errorMessage,
          hint: "Please download the template again to get the correct IDs for your school",
          results,
        });
      }
    }

    res.json({
      message: `Import completed: ${results.success.length} success, ${results.errors.length} errors`,
      results: {
        total: results.total,
        success: results.success.length,
        errors: results.errors.length,
        errorDetails: results.errors,
      },
      created: createdStudents.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download Excel template for import
export const downloadExcelTemplate = async (req, res) => {
  try {
    // Get user's school_id from token
    const userSchoolId = req.user?.school_id || 1;
    
    // Fetch available data for the user's school
    const [grades, classes, departments, academicYears] = await Promise.all([
      Grade.findAll({ where: { school_id: userSchoolId }, attributes: ['id', 'name'] }),
      ClassRoom.findAll({ where: { school_id: userSchoolId }, attributes: ['id', 'name'] }),
      Department.findAll({ where: { school_id: userSchoolId }, attributes: ['id', 'name'] }),
      AcademicYear.findAll({ where: { school_id: userSchoolId }, attributes: ['id', 'year'] })
    ]);
    
    // Create template data
    const templateData = [
      {
        name: "Contoh Nama Siswa",
        school_id: userSchoolId,
        academic_year_id: academicYears.length > 0 ? academicYears[0].id : "",
        grade_id: grades.length > 0 ? grades[0].id : "",
        class_id: classes.length > 0 ? classes[0].id : "",
        department_id: departments.length > 0 ? departments[0].id : "",
        nis: "12345",
        nisn: "1234567890",
        date_of_birth: "2010-01-15",
        gender: "L",
        address: "Jl. Contoh No. 123",
        parent_name: "Nama Orang Tua",
        parent_phone: "081234567890",
      },
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Add reference sheet with available IDs
    const referenceData = [
      { type: 'SCHOOL', id: userSchoolId, name: 'Your School' },
      { type: '', id: '', name: '' },
      { type: 'GRADES', id: '', name: 'Available Grades:' },
      ...grades.map(g => ({ type: '', id: g.id, name: g.name })),
      { type: '', id: '', name: '' },
      { type: 'CLASSES', id: '', name: 'Available Classes:' },
      ...classes.map(c => ({ type: '', id: c.id, name: c.name })),
      { type: '', id: '', name: '' },
      { type: 'DEPARTMENTS', id: '', name: 'Available Departments:' },
      ...departments.map(d => ({ type: '', id: d.id, name: d.name })),
      { type: '', id: '', name: '' },
      { type: 'ACADEMIC_YEARS', id: '', name: 'Available Academic Years:' },
      ...academicYears.map(ay => ({ type: '', id: ay.id, name: ay.year })),
    ];
    
    const referenceSheet = XLSX.utils.json_to_sheet(referenceData);

    // Set column widths for main sheet
    worksheet["!cols"] = [
      { wch: 20 }, // name
      { wch: 10 }, // school_id
      { wch: 15 }, // academic_year_id
      { wch: 10 }, // grade_id
      { wch: 10 }, // class_id
      { wch: 12 }, // department_id
      { wch: 10 }, // nis
      { wch: 12 }, // nisn
      { wch: 12 }, // date_of_birth
      { wch: 8 },  // gender
      { wch: 30 }, // address
      { wch: 20 }, // parent_name
      { wch: 15 }, // parent_phone
    ];
    
    // Set column widths for reference sheet
    referenceSheet["!cols"] = [
      { wch: 20 }, // type
      { wch: 10 }, // id
      { wch: 40 }, // name
    ];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Import Siswa");
    XLSX.utils.book_append_sheet(workbook, referenceSheet, "Referensi ID");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=template_import_siswa.xlsx"
    );

    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Generate card number for student
 */
export const generateCardNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const student = await Student.findOne({
      where: { id, school_id },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    // Generate card number format: SCHOOLID-YEAR-SEQUENCE
    const year = new Date().getFullYear();
    const lastCard = await Student.findOne({
      where: {
        school_id,
        card_number: {
          [Op.like]: `${school_id}-${year}-%`,
        },
      },
      order: [["card_number", "DESC"]],
    });

    let sequence = 1;
    if (lastCard && lastCard.card_number) {
      const parts = lastCard.card_number.split("-");
      sequence = parseInt(parts[2] || 0) + 1;
    }

    const cardNumber = `${school_id}-${year}-${sequence.toString().padStart(6, "0")}`;

    await student.update({ card_number: cardNumber });

    res.json({
      success: true,
      message: "Nomor kartu berhasil dibuat",
      data: { card_number: cardNumber },
    });
  } catch (error) {
    console.error("Error generating card number:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat nomor kartu",
      error: error.message,
    });
  }
};

/**
 * Generate QR Code for student
 */
export const generateQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const student = await Student.findOne({
      where: { id, school_id },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    // Generate QR code data (can be customized)
    const qrData = JSON.stringify({
      student_id: student.id,
      nis: student.nis,
      name: student.name,
      school_id: student.school_id,
    });

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1,
    });

    await student.update({ qr_code: qrCodeDataURL });

    res.json({
      success: true,
      message: "QR Code berhasil dibuat",
      data: { qr_code: qrCodeDataURL },
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat QR code",
      error: error.message,
    });
  }
};

/**
 * Generate barcode for student
 */
export const generateBarcode = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const student = await Student.findOne({
      where: { id, school_id },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    if (!student.card_number) {
      return res.status(400).json({
        success: false,
        message: "Nomor kartu belum dibuat. Generate nomor kartu terlebih dahulu.",
      });
    }

    // Generate barcode using card number
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: student.card_number,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    // Convert to base64
    const barcodeDataURL = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;

    await student.update({ barcode: barcodeDataURL });

    res.json({
      success: true,
      message: "Barcode berhasil dibuat",
      data: { barcode: barcodeDataURL },
    });
  } catch (error) {
    console.error("Error generating barcode:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat barcode",
      error: error.message,
    });
  }
};

/**
 * Assign card template to student
 */
export const assignCardTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_template_id } = req.body;
    const school_id = req.user.school_id;

    const student = await Student.findOne({
      where: { id, school_id },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    // Verify template exists and belongs to school
    if (card_template_id) {
      const template = await CardTemplate.findOne({
        where: { id: card_template_id, school_id },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template kartu tidak ditemukan",
        });
      }
    }

    await student.update({ card_template_id });

    res.json({
      success: true,
      message: "Template berhasil diterapkan",
      data: student,
    });
  } catch (error) {
    console.error("Error assigning template:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menerapkan template",
      error: error.message,
    });
  }
};

/**
 * Get student card data with template
 */
export const getStudentCard = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const student = await Student.findOne({
      where: { id, school_id },
      include: [
        {
          model: School,
          as: "school",
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
          model: CardTemplate,
          as: "cardTemplate",
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    // If no template assigned, get default template
    let template = student.cardTemplate;
    if (!template) {
      template = await CardTemplate.findOne({
        where: { school_id, is_default: true },
      });
    }

    res.json({
      success: true,
      data: {
        student,
        template,
      },
    });
  } catch (error) {
    console.error("Error getting student card:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data kartu siswa",
      error: error.message,
    });
  }
};

/**
 * Generate all card data for student (card number, QR, barcode)
 */
export const generateAllCardData = async (req, res) => {
  try {
    const { id } = req.params;
    const school_id = req.user.school_id;

    const student = await Student.findOne({
      where: { id, school_id },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    // Generate card number
    const year = new Date().getFullYear();
    const lastCard = await Student.findOne({
      where: {
        school_id,
        card_number: {
          [Op.like]: `${school_id}-${year}-%`,
        },
      },
      order: [["card_number", "DESC"]],
    });

    let sequence = 1;
    if (lastCard && lastCard.card_number) {
      const parts = lastCard.card_number.split("-");
      sequence = parseInt(parts[2] || 0) + 1;
    }

    const cardNumber = `${school_id}-${year}-${sequence.toString().padStart(6, "0")}`;

    // Generate QR code
    const qrData = JSON.stringify({
      student_id: student.id,
      nis: student.nis,
      name: student.name,
      school_id: student.school_id,
      card_number: cardNumber,
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1,
    });

    // Generate barcode
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: cardNumber,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
    });

    const barcodeDataURL = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;

    // Update student
    await student.update({
      card_number: cardNumber,
      qr_code: qrCodeDataURL,
      barcode: barcodeDataURL,
    });

    res.json({
      success: true,
      message: "Data kartu berhasil dibuat",
      data: {
        card_number: cardNumber,
        qr_code: qrCodeDataURL,
        barcode: barcodeDataURL,
      },
    });
  } catch (error) {
    console.error("Error generating card data:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat data kartu",
      error: error.message,
    });
  }
};

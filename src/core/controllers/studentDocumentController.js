import {
  DocumentType,
  StudentDocument,
  School,
  Student,
  User,
} from "../models/index.js";
import { uploadFile, deleteFile } from "../../config/minio.js";
import { Op } from "sequelize";

// ==================== DOCUMENT TYPES ====================

// Get all document types
export const getAllDocumentTypes = async (req, res) => {
  try {
    const { school_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await DocumentType.findAndCountAll({
      where: { school_id },
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
      ],
      order: [["required", "DESC"], ["name", "ASC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in getAllDocumentTypes:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get document type by ID
export const getDocumentTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const documentType = await DocumentType.findOne({
      where: { id, school_id },
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!documentType) {
      return res.status(404).json({ error: "Document type not found" });
    }

    res.status(200).json(documentType);
  } catch (error) {
    console.error("Error in getDocumentTypeById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create document type
export const createDocumentType = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { code, name, required, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        error: "code and name are required",
      });
    }

    // Check if code already exists
    const existing = await DocumentType.findOne({
      where: { school_id, code },
    });

    if (existing) {
      return res.status(400).json({
        error: "Document type code already exists",
      });
    }

    const documentType = await DocumentType.create({
      school_id,
      code,
      name,
      required: required || false,
      description,
    });

    res.status(201).json(documentType);
  } catch (error) {
    console.error("Error in createDocumentType:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update document type
export const updateDocumentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;
    const { code, name, required, description } = req.body;

    const documentType = await DocumentType.findOne({
      where: { id, school_id },
    });

    if (!documentType) {
      return res.status(404).json({ error: "Document type not found" });
    }

    // Check if new code conflicts with existing
    if (code && code !== documentType.code) {
      const existing = await DocumentType.findOne({
        where: { school_id, code, id: { [Op.ne]: id } },
      });

      if (existing) {
        return res.status(400).json({
          error: "Document type code already exists",
        });
      }
    }

    await documentType.update({
      code: code || documentType.code,
      name: name || documentType.name,
      required: required !== undefined ? required : documentType.required,
      description: description !== undefined ? description : documentType.description,
    });

    res.status(200).json(documentType);
  } catch (error) {
    console.error("Error in updateDocumentType:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete document type
export const deleteDocumentType = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const documentType = await DocumentType.findOne({
      where: { id, school_id },
    });

    if (!documentType) {
      return res.status(404).json({ error: "Document type not found" });
    }

    // Check if document type is used in student documents
    const usageCount = await StudentDocument.count({
      where: { document_type_id: id },
    });

    if (usageCount > 0) {
      return res.status(400).json({
        error: `Cannot delete document type. It is being used by ${usageCount} student document(s)`,
      });
    }

    await documentType.destroy();

    res.status(200).json({ message: "Document type deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDocumentType:", error);
    res.status(500).json({ error: error.message });
  }
};

// ==================== STUDENT DOCUMENTS ====================

// Get all student documents with pagination
export const getAllStudentDocuments = async (req, res) => {
  try {
    const { school_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filter options
    const filters = { school_id };
    if (req.query.student_id) filters.student_id = req.query.student_id;
    if (req.query.document_type) filters.document_type = req.query.document_type;
    if (req.query.document_type_id) filters.document_type_id = req.query.document_type_id;

    const { count, rows } = await StudentDocument.findAndCountAll({
      where: filters,
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "nisn", "nis"],
        },
        {
          model: DocumentType,
          as: "documentTypeInfo",
          attributes: ["id", "code", "name", "required"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in getAllStudentDocuments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get student documents by student ID
export const getStudentDocumentsByStudentId = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { school_id } = req.user;

    // Verify student belongs to school
    const student = await Student.findOne({
      where: { id: student_id, school_id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const documents = await StudentDocument.findAll({
      where: { student_id, school_id },
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "nisn", "nis"],
        },
        {
          model: DocumentType,
          as: "documentTypeInfo",
          attributes: ["id", "code", "name", "required"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({ data: documents });
  } catch (error) {
    console.error("Error in getStudentDocumentsByStudentId:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get document by ID
export const getStudentDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const document = await StudentDocument.findOne({
      where: { id, school_id },
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "nisn", "nis"],
        },
        {
          model: DocumentType,
          as: "documentTypeInfo",
          attributes: ["id", "code", "name", "required"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error("Error in getStudentDocumentById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create student document
export const createStudentDocument = async (req, res) => {
  try {
    const { school_id, user_id } = req.user;
    const {
      student_id,
      document_type_id,
      document_type,
      document_number,
      issued_date,
      notes,
    } = req.body;

    // Validate required fields
    if (!student_id || !document_type) {
      return res.status(400).json({
        error: "student_id and document_type are required",
      });
    }

    // Verify student belongs to school
    const student = await Student.findOne({
      where: { id: student_id, school_id },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // If document_type_id provided, verify it exists
    if (document_type_id) {
      const docType = await DocumentType.findOne({
        where: { id: document_type_id, school_id },
      });

      if (!docType) {
        return res.status(404).json({ error: "Document type not found" });
      }
    }

    const document = await StudentDocument.create({
      school_id,
      student_id,
      document_type_id,
      document_type,
      document_number,
      issued_date,
      notes,
      created_by: user_id,
      updated_by: user_id,
    });

    // Get document with relations
    const documentWithRelations = await StudentDocument.findByPk(document.id, {
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "nisn", "nis"],
        },
        {
          model: DocumentType,
          as: "documentTypeInfo",
          attributes: ["id", "code", "name", "required"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json(documentWithRelations);
  } catch (error) {
    console.error("Error in createStudentDocument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload document file
export const uploadDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, user_id } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const document = await StudentDocument.findOne({
      where: { id, school_id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Delete old file if exists
    if (document.document_key) {
      try {
        await deleteFile(document.document_key);
      } catch (err) {
        console.error("Error deleting old file:", err);
      }
    }

    // Upload to MinIO
    const uploadResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "student-documents"
    );

    // Update document
    await document.update({
      document_file: uploadResult.url,
      document_key: uploadResult.key,
      updated_by: user_id,
    });

    res.status(200).json({
      message: "Document file uploaded successfully",
      document_file: uploadResult.url,
    });
  } catch (error) {
    console.error("Error in uploadDocumentFile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update student document
export const updateStudentDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, user_id } = req.user;
    const {
      document_type_id,
      document_type,
      document_number,
      issued_date,
      notes,
    } = req.body;

    const document = await StudentDocument.findOne({
      where: { id, school_id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // If document_type_id provided, verify it exists
    if (document_type_id) {
      const docType = await DocumentType.findOne({
        where: { id: document_type_id, school_id },
      });

      if (!docType) {
        return res.status(404).json({ error: "Document type not found" });
      }
    }

    await document.update({
      document_type_id: document_type_id !== undefined ? document_type_id : document.document_type_id,
      document_type: document_type || document.document_type,
      document_number: document_number !== undefined ? document_number : document.document_number,
      issued_date: issued_date !== undefined ? issued_date : document.issued_date,
      notes: notes !== undefined ? notes : document.notes,
      updated_by: user_id,
    });

    // Get updated document with relations
    const documentWithRelations = await StudentDocument.findByPk(document.id, {
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "nisn", "nis"],
        },
        {
          model: DocumentType,
          as: "documentTypeInfo",
          attributes: ["id", "code", "name", "required"],
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json(documentWithRelations);
  } catch (error) {
    console.error("Error in updateStudentDocument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete student document
export const deleteStudentDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const document = await StudentDocument.findOne({
      where: { id, school_id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Delete file from MinIO if exists
    if (document.document_key) {
      try {
        await deleteFile(document.document_key);
      } catch (err) {
        console.error("Error deleting document file:", err);
      }
    }

    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error in deleteStudentDocument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete document file only
export const deleteDocumentFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, user_id } = req.user;

    const document = await StudentDocument.findOne({
      where: { id, school_id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (!document.document_key) {
      return res.status(404).json({ error: "No file found" });
    }

    // Delete from MinIO
    try {
      await deleteFile(document.document_key);
    } catch (err) {
      console.error("Error deleting file:", err);
    }

    // Update document
    await document.update({
      document_file: null,
      document_key: null,
      updated_by: user_id,
    });

    res.status(200).json({ message: "Document file deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDocumentFile:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get document statistics
export const getDocumentStatistics = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { student_id } = req.query;

    const whereClause = { school_id };
    if (student_id) whereClause.student_id = student_id;

    // Get all documents
    const documents = await StudentDocument.findAll({
      where: whereClause,
      include: [
        {
          model: DocumentType,
          as: "documentTypeInfo",
          attributes: ["id", "code", "name", "required"],
        },
      ],
    });

    // Calculate statistics
    const stats = {
      total: documents.length,
      withFile: 0,
      withoutFile: 0,
      byDocumentType: {},
    };

    documents.forEach(doc => {
      if (doc.document_file) {
        stats.withFile++;
      } else {
        stats.withoutFile++;
      }

      const typeName = doc.documentTypeInfo?.name || doc.document_type;
      stats.byDocumentType[typeName] = (stats.byDocumentType[typeName] || 0) + 1;
    });

    res.status(200).json({ data: stats });
  } catch (error) {
    console.error("Error in getDocumentStatistics:", error);
    res.status(500).json({ error: error.message });
  }
};

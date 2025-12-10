import { ParentProfile, ParentDocument, Student, Grade, ClassRoom } from "../models/index.js";
import { uploadFile, deleteFile, getSignedFileUrl } from "../../config/minio.js";
import { Op } from "sequelize";

const parentProfileController = {
  /**
   * Get all parent profiles (for master data)
   */
  async getAll(req, res) {
    try {
      const school_id = req.user.school_id;
      const { page = 1, limit = 20, search = '', type = '', grade_id = '' } = req.query;

      const offset = (page - 1) * limit;
      const where = {};
      const studentWhere = { school_id };

      if (type) {
        where.type = type;
      }

      if (grade_id) {
        studentWhere.grade_id = grade_id;
      }

      // Build search condition
      let searchCondition = {};
      if (search) {
        searchCondition = {
          [Op.or]: [
            { full_name: { [Op.like]: `%${search}%` } },
            { nik: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
          ],
        };
      }

      const { count, rows } = await ParentProfile.findAndCountAll({
        where: { ...where, ...searchCondition },
        include: [
          {
            model: Student,
            as: "student",
            where: studentWhere,
            include: [
              { model: Grade, as: "grade" },
              { model: ClassRoom, as: "class" },
            ],
          },
          {
            model: ParentDocument,
            as: "documents",
          },
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["created_at", "DESC"]],
      });

      // Get signed URLs for documents
      for (const parent of rows) {
        if (parent.documents) {
          for (const doc of parent.documents) {
            if (doc.document_file) {
              try {
                const signedUrl = await getSignedFileUrl(doc.document_file);
                doc.dataValues.document_url = signedUrl;
              } catch (error) {
                console.error("Error getting signed URL:", error);
              }
            }
          }
        }
      }

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Error getting all parents:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data orang tua",
        error: error.message,
      });
    }
  },

  /**
   * Get all parent profiles for a student
   */
  async getByStudent(req, res) {
    try {
      const { student_id } = req.params;
      const school_id = req.user.school_id;

      // Verify student belongs to school
      const student = await Student.findOne({
        where: { id: student_id, school_id },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Siswa tidak ditemukan",
        });
      }

      const parents = await ParentProfile.findAll({
        where: { student_id },
        include: [
          {
            model: ParentDocument,
            as: "documents",
          },
        ],
        order: [
          ["is_guardian", "DESC"],
          ["type", "ASC"],
        ],
      });

      // Get signed URLs for documents
      for (const parent of parents) {
        if (parent.documents) {
          for (const doc of parent.documents) {
            if (doc.document_file) {
              try {
                const signedUrl = await getSignedFileUrl(doc.document_file);
                doc.dataValues.document_url = signedUrl;
              } catch (error) {
                console.error("Error getting signed URL:", error);
              }
            }
          }
        }
      }

      res.json({
        success: true,
        data: parents,
      });
    } catch (error) {
      console.error("Error getting parent profiles:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data orang tua",
        error: error.message,
      });
    }
  },

  /**
   * Create or update parent profile
   */
  async saveParent(req, res) {
    try {
      const { student_id } = req.params;
      const school_id = req.user.school_id;
      const { id, type, full_name, nik, phone, email, occupation, education, is_guardian, address } = req.body;

      // Verify student belongs to school
      const student = await Student.findOne({
        where: { id: student_id, school_id },
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Siswa tidak ditemukan",
        });
      }

      // If this parent is set as guardian, unset others
      if (is_guardian) {
        await ParentProfile.update(
          { is_guardian: false },
          { where: { student_id } }
        );
      }

      let parent;
      if (id) {
        // Update existing
        parent = await ParentProfile.findOne({
          where: { id, student_id },
        });

        if (!parent) {
          return res.status(404).json({
            success: false,
            message: "Data orang tua tidak ditemukan",
          });
        }

        await parent.update({
          type,
          full_name,
          nik,
          phone,
          email,
          occupation,
          education,
          is_guardian,
          address,
        });
      } else {
        // Create new
        parent = await ParentProfile.create({
          student_id,
          type,
          full_name,
          nik,
          phone,
          email,
          occupation,
          education,
          is_guardian,
          address,
        });
      }

      res.json({
        success: true,
        message: id ? "Data orang tua berhasil diperbarui" : "Data orang tua berhasil ditambahkan",
        data: parent,
      });
    } catch (error) {
      console.error("Error saving parent profile:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menyimpan data orang tua",
        error: error.message,
      });
    }
  },

  /**
   * Delete parent profile
   */
  async deleteParent(req, res) {
    try {
      const { id } = req.params;
      const school_id = req.user.school_id;

      const parent = await ParentProfile.findOne({
        where: { id },
        include: [
          {
            model: Student,
            as: "student",
            where: { school_id },
          },
          {
            model: ParentDocument,
            as: "documents",
          },
        ],
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Data orang tua tidak ditemukan",
        });
      }

      // Delete all documents from MinIO
      if (parent.documents) {
        for (const doc of parent.documents) {
          try {
            await deleteFile(doc.document_file);
          } catch (error) {
            console.error("Error deleting document file:", error);
          }
        }
      }

      await parent.destroy();

      res.json({
        success: true,
        message: "Data orang tua berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting parent profile:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus data orang tua",
        error: error.message,
      });
    }
  },

  /**
   * Upload parent document
   */
  async uploadDocument(req, res) {
    try {
      const { parent_id } = req.params;
      const school_id = req.user.school_id;
      const { document_type } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "File dokumen wajib diupload",
        });
      }

      // Verify parent belongs to school
      const parent = await ParentProfile.findOne({
        where: { id: parent_id },
        include: [
          {
            model: Student,
            as: "student",
            where: { school_id },
          },
        ],
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Data orang tua tidak ditemukan",
        });
      }

      // Upload to MinIO
      const uploadResult = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        `parent-documents/${school_id}`
      );

      // Save to database
      const document = await ParentDocument.create({
        parent_id,
        document_type,
        document_file: uploadResult.key,
      });

      // Get signed URL
      const signedUrl = await getSignedFileUrl(uploadResult.key);
      document.dataValues.document_url = signedUrl;

      res.json({
        success: true,
        message: "Dokumen berhasil diupload",
        data: document,
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengupload dokumen",
        error: error.message,
      });
    }
  },

  /**
   * Delete parent document
   */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;
      const school_id = req.user.school_id;

      const document = await ParentDocument.findOne({
        where: { id },
        include: [
          {
            model: ParentProfile,
            as: "parent",
            include: [
              {
                model: Student,
                as: "student",
                where: { school_id },
              },
            ],
          },
        ],
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Dokumen tidak ditemukan",
        });
      }

      // Delete from MinIO
      try {
        await deleteFile(document.document_file);
      } catch (error) {
        console.error("Error deleting file from MinIO:", error);
      }

      await document.destroy();

      res.json({
        success: true,
        message: "Dokumen berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus dokumen",
        error: error.message,
      });
    }
  },
};

export default parentProfileController;

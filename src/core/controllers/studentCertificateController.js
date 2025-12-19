import {
    StudentCertificate,
    School,
    Student,
    Achievement,
    CertificateTemplate,
    User,
    Grade,
    ClassRoom,
} from "../models/index.js";
import { uploadFile, deleteFile } from "../../config/minio.js";
import { Op } from "sequelize";

// Get all student certificates
export const getAllStudentCertificates = async (req, res) => {
    try {
        const {
            school_id,
            student_id,
            achievement_id,
            template_id,
            page = 1,
            limit = 10,
        } = req.query;

        const where = {};
        if (school_id) where.school_id = school_id;
        if (student_id) where.student_id = student_id;
        if (achievement_id) where.achievement_id = achievement_id;
        if (template_id) where.template_id = template_id;

        // Convert to numbers and validate
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;

        const { count, rows: certificates } = await StudentCertificate.findAndCountAll({
            where,
            include: [
                {
                    model: School,
                    as: "school",
                    attributes: ["id", "name"],
                },
                {
                    model: Student,
                    as: "student",
                    attributes: ["id", "name", "nis", "nisn"],
                    include: [
                        {
                            model: Grade,
                            as: "grade",
                            attributes: ["id", "name"],
                        },
                        {
                            model: ClassRoom,
                            as: "class",
                            attributes: ["id", "name"],
                        },
                    ],
                },
                {
                    model: Achievement,
                    as: "achievement",
                    attributes: ["id", "title", "event_type", "level"],
                },
                {
                    model: CertificateTemplate,
                    as: "template",
                    attributes: ["id", "name"],
                },
                {
                    model: User,
                    as: "creator",
                    attributes: ["id", "name"],
                },
            ],
            limit: limitNum,
            offset: offset,
            order: [["created_at", "DESC"]],
        });

        const totalPages = Math.ceil(count / limitNum);

        res.json({
            data: certificates,
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
        console.error("Error getting student certificates:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get student certificate by ID
export const getStudentCertificateById = async (req, res) => {
    try {
        const certificate = await StudentCertificate.findByPk(req.params.id, {
            include: [
                {
                    model: School,
                    as: "school",
                },
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: Grade,
                            as: "grade",
                        },
                        {
                            model: ClassRoom,
                            as: "class",
                        },
                    ],
                },
                {
                    model: Achievement,
                    as: "achievement",
                },
                {
                    model: CertificateTemplate,
                    as: "template",
                },
                {
                    model: User,
                    as: "creator",
                },
            ],
        });

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        res.json(certificate);
    } catch (error) {
        console.error("Error getting certificate:", error);
        res.status(500).json({ message: error.message });
    }
};

// Create student certificate
export const createStudentCertificate = async (req, res) => {
    try {
        const {
            school_id,
            student_id,
            achievement_id,
            template_id,
            certificate_number,
            certificate_title,
            issued_date,
        } = req.body;

        // Validate required fields
        if (!school_id || !student_id) {
            return res.status(400).json({
                message: "School ID and Student ID are required",
            });
        }

        // Check if student exists
        const student = await Student.findByPk(student_id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if achievement exists (if provided)
        if (achievement_id) {
            const achievement = await Achievement.findByPk(achievement_id);
            if (!achievement) {
                return res.status(404).json({ message: "Achievement not found" });
            }
        }

        // Check if template exists (if provided)
        if (template_id) {
            const template = await CertificateTemplate.findByPk(template_id);
            if (!template) {
                return res.status(404).json({ message: "Certificate template not found" });
            }
        }

        const certificate = await StudentCertificate.create({
            school_id,
            student_id,
            achievement_id: achievement_id || null,
            template_id: template_id || null,
            certificate_number: certificate_number || null,
            certificate_title: certificate_title || "Piagam Penghargaan",
            issued_date: issued_date || new Date(),
            created_by: req.user?.id || null,
        });

        // Fetch the created certificate with associations
        const createdCertificate = await StudentCertificate.findByPk(certificate.id, {
            include: [
                {
                    model: School,
                    as: "school",
                    attributes: ["id", "name"],
                },
                {
                    model: Student,
                    as: "student",
                    attributes: ["id", "name", "nis"],
                },
                {
                    model: Achievement,
                    as: "achievement",
                    attributes: ["id", "title"],
                },
                {
                    model: CertificateTemplate,
                    as: "template",
                    attributes: ["id", "name"],
                },
            ],
        });

        res.status(201).json(createdCertificate);
    } catch (error) {
        console.error("Error creating certificate:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update student certificate
export const updateStudentCertificate = async (req, res) => {
    try {
        const {
            student_id,
            achievement_id,
            template_id,
            certificate_number,
            certificate_title,
            issued_date,
        } = req.body;

        const certificate = await StudentCertificate.findByPk(req.params.id);
        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        // Validate student if changed
        if (student_id && student_id !== certificate.student_id) {
            const student = await Student.findByPk(student_id);
            if (!student) {
                return res.status(404).json({ message: "Student not found" });
            }
        }

        // Validate achievement if changed
        if (achievement_id && achievement_id !== certificate.achievement_id) {
            const achievement = await Achievement.findByPk(achievement_id);
            if (!achievement) {
                return res.status(404).json({ message: "Achievement not found" });
            }
        }

        // Validate template if changed
        if (template_id && template_id !== certificate.template_id) {
            const template = await CertificateTemplate.findByPk(template_id);
            if (!template) {
                return res.status(404).json({ message: "Certificate template not found" });
            }
        }

        await certificate.update({
            student_id: student_id || certificate.student_id,
            achievement_id: achievement_id !== undefined ? achievement_id : certificate.achievement_id,
            template_id: template_id !== undefined ? template_id : certificate.template_id,
            certificate_number: certificate_number !== undefined ? certificate_number : certificate.certificate_number,
            certificate_title: certificate_title || certificate.certificate_title,
            issued_date: issued_date || certificate.issued_date,
        });

        // Fetch updated certificate with associations
        const updatedCertificate = await StudentCertificate.findByPk(certificate.id, {
            include: [
                {
                    model: School,
                    as: "school",
                    attributes: ["id", "name"],
                },
                {
                    model: Student,
                    as: "student",
                    attributes: ["id", "name", "nis"],
                },
                {
                    model: Achievement,
                    as: "achievement",
                    attributes: ["id", "title"],
                },
                {
                    model: CertificateTemplate,
                    as: "template",
                    attributes: ["id", "name"],
                },
            ],
        });

        res.json(updatedCertificate);
    } catch (error) {
        console.error("Error updating certificate:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete student certificate
export const deleteStudentCertificate = async (req, res) => {
    try {
        const certificate = await StudentCertificate.findByPk(req.params.id);
        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        // Delete file from MinIO if exists
        if (certificate.file_key) {
            try {
                await deleteFile(certificate.file_key);
            } catch (error) {
                console.error("Failed to delete file from MinIO:", error);
                // Continue deleting certificate even if file deletion fails
            }
        }

        await certificate.destroy();
        res.json({ message: "Certificate deleted successfully" });
    } catch (error) {
        console.error("Error deleting certificate:", error);
        res.status(500).json({ message: error.message });
    }
};

// Upload certificate PDF file
export const uploadCertificateFile = async (req, res) => {
    try {
        const certificate = await StudentCertificate.findByPk(req.params.id);
        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Delete old file if exists
        if (certificate.file_key) {
            try {
                await deleteFile(certificate.file_key);
            } catch (error) {
                console.error("Failed to delete old file:", error);
                // Continue with upload even if old file deletion fails
            }
        }

        // Upload new file to MinIO
        const { key, url } = await uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            `certificates/${certificate.school_id}`
        );

        // Update certificate record with file info
        await certificate.update({
            file_path: url,
            file_key: key,
        });

        res.json({
            message: "Certificate file uploaded successfully",
            file_path: url,
            file_key: key,
        });
    } catch (error) {
        console.error("Error uploading certificate file:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete certificate file
export const deleteCertificateFile = async (req, res) => {
    try {
        const certificate = await StudentCertificate.findByPk(req.params.id);
        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        if (!certificate.file_key) {
            return res.status(404).json({ message: "Certificate has no file" });
        }

        // Delete file from MinIO
        await deleteFile(certificate.file_key);

        // Update certificate record
        await certificate.update({
            file_path: null,
            file_key: null,
        });

        res.json({ message: "Certificate file deleted successfully" });
    } catch (error) {
        console.error("Error deleting certificate file:", error);
        res.status(500).json({ message: error.message });
    }
};

// Generate certificate PDF data (for frontend rendering)
export const generateCertificatePDF = async (req, res) => {
    try {
        const certificate = await StudentCertificate.findByPk(req.params.id, {
            include: [
                {
                    model: School,
                    as: "school",
                },
                {
                    model: Student,
                    as: "student",
                    include: [
                        {
                            model: Grade,
                            as: "grade",
                        },
                        {
                            model: ClassRoom,
                            as: "class",
                        },
                    ],
                },
                {
                    model: Achievement,
                    as: "achievement",
                },
                {
                    model: CertificateTemplate,
                    as: "template",
                },
            ],
        });

        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }

        // Get template (use assigned template or default template)
        let template = certificate.template;

        if (!template) {
            // Find default template for the school
            template = await CertificateTemplate.findOne({
                where: {
                    school_id: certificate.school_id,
                    is_default: true,
                    is_active: true,
                },
            });
        }

        if (!template) {
            // If no default, get any active template
            template = await CertificateTemplate.findOne({
                where: {
                    school_id: certificate.school_id,
                    is_active: true,
                },
                order: [["created_at", "DESC"]],
            });
        }

        if (!template) {
            return res.status(404).json({
                message: "No certificate template found. Please create a template first.",
            });
        }

        // Prepare certificate data
        const certificateData = {
            certificate_number: certificate.certificate_number || `CERT-${certificate.id}`,
            certificate_title: certificate.certificate_title || "Piagam Penghargaan",
            student_name: certificate.student?.name || "-",
            nis: certificate.student?.nis || "-",
            nisn: certificate.student?.nisn || "-",
            grade: certificate.student?.grade?.name || "-",
            class: certificate.student?.class?.name || "-",
            achievement_title: certificate.achievement?.title || "-",
            achievement_level: certificate.achievement?.level || "-",
            achievement_type: certificate.achievement?.event_type || "-",
            school_name: certificate.school?.name || "-",
            issued_date: certificate.issued_date
                ? new Date(certificate.issued_date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                })
                : new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                }),
        };

        res.json({
            success: true,
            data: {
                certificate: certificateData,
                template: {
                    id: template.id,
                    name: template.name,
                    background_image: template.background_image_key
                        ? `http://localhost:4000/api/proxy/image/${encodeURIComponent(template.background_image_key)}`
                        : template.background_image,
                    orientation: template.orientation,
                    certificate_width: template.certificate_width,
                    certificate_height: template.certificate_height,
                    background_fit: template.background_fit,
                    layout: template.layout,
                },
            },
        });
    } catch (error) {
        console.error("Error generating certificate PDF:", error);
        res.status(500).json({ message: error.message });
    }
};

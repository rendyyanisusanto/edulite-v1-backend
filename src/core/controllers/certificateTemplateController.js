import { CertificateTemplate, School } from "../models/index.js";
import { uploadFile, deleteFile, getSignedFileUrl } from "../../config/minio.js";

class CertificateTemplateController {
    /**
     * Get all certificate templates for logged-in user's school
     */
    async getAllTemplates(req, res) {
        try {
            const school_id = req.user.school_id;
            const { is_active, orientation } = req.query;

            const where = { school_id };

            // Filter by active status if provided (not empty string)
            if (is_active !== undefined && is_active !== '' && is_active !== null) {
                where.is_active = is_active === 'true' || is_active === '1';
            }

            // Filter by orientation if provided
            if (orientation) {
                where.orientation = orientation;
            }

            const templates = await CertificateTemplate.findAll({
                where,
                include: [
                    {
                        model: School,
                        as: "school",
                        attributes: ["id", "name"],
                    },
                ],
                order: [
                    ["is_active", "DESC"],
                    ["created_at", "DESC"],
                ],
            });

            res.json({
                success: true,
                data: templates,
            });
        } catch (error) {
            console.error("Error getting certificate templates:", error);
            res.status(500).json({
                success: false,
                message: "Gagal mengambil data template sertifikat",
                error: error.message,
            });
        }
    }

    /**
     * Get certificate template by ID
     */
    async getTemplateById(req, res) {
        try {
            const { id } = req.params;
            const school_id = req.user.school_id;

            const template = await CertificateTemplate.findOne({
                where: { id, school_id },
                include: [
                    {
                        model: School,
                        as: "school",
                        attributes: ["id", "name"],
                    },
                ],
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template sertifikat tidak ditemukan",
                });
            }

            res.json({
                success: true,
                data: template,
            });
        } catch (error) {
            console.error("Error getting certificate template:", error);
            res.status(500).json({
                success: false,
                message: "Gagal mengambil data template sertifikat",
                error: error.message,
            });
        }
    }

    /**
     * Create new certificate template
     */
    async createTemplate(req, res) {
        try {
            const school_id = req.user.school_id;
            const { name, description, orientation, layout, is_active, is_default, certificate_width, certificate_height, background_fit } = req.body;

            // Validate required fields
            if (!name || !orientation) {
                return res.status(400).json({
                    success: false,
                    message: "Nama dan orientasi wajib diisi",
                });
            }

            // Validate orientation
            if (!['portrait', 'landscape'].includes(orientation)) {
                return res.status(400).json({
                    success: false,
                    message: "Orientasi harus 'portrait' atau 'landscape'",
                });
            }

            // If this is set as default, unset other defaults
            if (is_default) {
                await CertificateTemplate.update(
                    { is_default: false },
                    { where: { school_id, is_default: true } }
                );
            }

            // Handle background image upload if exists
            let background_image = null;
            let background_image_key = null;
            if (req.file) {
                const uploadResult = await uploadFile(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype,
                    `certificate-backgrounds/${school_id}`
                );
                background_image = uploadResult.url;
                background_image_key = uploadResult.key;
            }

            const template = await CertificateTemplate.create({
                school_id,
                name,
                description,
                background_image,
                background_image_key,
                background_fit: background_fit || 'cover',
                orientation,
                certificate_width: certificate_width || 800,
                certificate_height: certificate_height || 600,
                layout: layout ? (typeof layout === 'string' ? JSON.parse(layout) : layout) : { elements: [] },
                is_default: is_default || false,
                is_active: is_active !== undefined ? is_active : true,
            });
            res.status(201).json({
                success: true,
                message: "Template sertifikat berhasil dibuat",
                data: template,
            });
        } catch (error) {
            console.error("Error creating certificate template:", error);
            res.status(500).json({
                success: false,
                message: "Gagal membuat template sertifikat",
                error: error.message,
            });
        }
    }

    /**
     * Update certificate template
     */
    async updateTemplate(req, res) {
        try {
            const { id } = req.params;
            const school_id = req.user.school_id;
            const { name, description, orientation, layout, is_active, is_default, certificate_width, certificate_height, background_fit } = req.body;

            const template = await CertificateTemplate.findOne({
                where: { id, school_id },
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template sertifikat tidak ditemukan",
                });
            }

            // Validate orientation if provided
            if (orientation && !['portrait', 'landscape'].includes(orientation)) {
                return res.status(400).json({
                    success: false,
                    message: "Orientasi harus 'portrait' atau 'landscape'",
                });
            }

            // If this is set as default, unset other defaults
            if (is_default && !template.is_default) {
                await CertificateTemplate.update(
                    { is_default: false },
                    { where: { school_id, is_default: true } }
                );
            }

            // Handle background image upload if exists
            let background_image = template.background_image;
            let background_image_key = template.background_image_key;
            if (req.file) {
                // Delete old background if exists
                if (background_image_key) {
                    try {
                        await deleteFile(background_image_key);
                    } catch (err) {
                        console.error("Error deleting old background:", err);
                    }
                }

                const uploadResult = await uploadFile(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype,
                    `certificate-backgrounds/${school_id}`
                );
                background_image = uploadResult.url;
                background_image_key = uploadResult.key;
            }

            await template.update({
                name: name || template.name,
                description: description !== undefined ? description : template.description,
                background_image,
                background_image_key,
                background_fit: background_fit || template.background_fit,
                orientation: orientation || template.orientation,
                certificate_width: certificate_width || template.certificate_width,
                certificate_height: certificate_height || template.certificate_height,
                layout: layout ? (typeof layout === 'string' ? JSON.parse(layout) : layout) : template.layout,
                is_default: is_default !== undefined ? is_default : template.is_default,
                is_active: is_active !== undefined ? is_active : template.is_active,
            });
            res.json({
                success: true,
                message: "Template sertifikat berhasil diperbarui",
                data: template,
            });
        } catch (error) {
            console.error("Error updating certificate template:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memperbarui template sertifikat",
                error: error.message,
            });
        }
    }

    /**
     * Delete certificate template (soft delete - set is_active to false)
     */
    async deleteTemplate(req, res) {
        try {
            const { id } = req.params;
            const school_id = req.user.school_id;

            const template = await CertificateTemplate.findOne({
                where: { id, school_id },
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template sertifikat tidak ditemukan",
                });
            }

            // Soft delete - just set is_active to false
            await template.update({ is_active: false });

            res.json({
                success: true,
                message: "Template sertifikat berhasil dinonaktifkan",
            });
        } catch (error) {
            console.error("Error deleting certificate template:", error);
            res.status(500).json({
                success: false,
                message: "Gagal menghapus template sertifikat",
                error: error.message,
            });
        }
    }

    /**
     * Hard delete certificate template (permanent delete)
     */
    async permanentDeleteTemplate(req, res) {
        try {
            const { id } = req.params;
            const school_id = req.user.school_id;

            const template = await CertificateTemplate.findOne({
                where: { id, school_id },
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template sertifikat tidak ditemukan",
                });
            }

            // Delete background image if exists
            if (template.background_image_key) {
                try {
                    await deleteFile(template.background_image_key);
                } catch (err) {
                    console.error("Error deleting background:", err);
                }
            }

            await template.destroy();

            res.json({
                success: true,
                message: "Template sertifikat berhasil dihapus permanen",
            });
        } catch (error) {
            console.error("Error permanently deleting certificate template:", error);
            res.status(500).json({
                success: false,
                message: "Gagal menghapus template sertifikat",
                error: error.message,
            });
        }
    }

    /**
     * Upload/update background image
     */
    async uploadBackground(req, res) {
        try {
            const { id } = req.params;
            const school_id = req.user.school_id;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "File background wajib diupload",
                });
            }

            const template = await CertificateTemplate.findOne({
                where: { id, school_id },
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template sertifikat tidak ditemukan",
                });
            }

            // Delete old background if exists
            if (template.background_image_key) {
                try {
                    await deleteFile(template.background_image_key);
                } catch (err) {
                    console.error("Error deleting old background:", err);
                }
            }

            // Upload new background
            const uploadResult = await uploadFile(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype,
                `certificate-backgrounds/${school_id}`
            );

            await template.update({
                background_image: uploadResult.url,
                background_image_key: uploadResult.key,
            });

            res.json({
                success: true,
                message: "Background berhasil diupload",
                data: {
                    background_image: uploadResult.url,
                    background_image_key: uploadResult.key,
                },
            });
        } catch (error) {
            console.error("Error uploading background:", error);
            res.status(500).json({
                success: false,
                message: "Gagal mengupload background",
                error: error.message,
            });
        }
    }

    /**
     * Get background image URL
     */
    async getBackgroundUrl(req, res) {
        try {
            const { id } = req.params;
            const school_id = req.user.school_id;

            const template = await CertificateTemplate.findOne({
                where: { id, school_id },
            });

            if (!template || !template.background_image_key) {
                return res.status(404).json({
                    success: false,
                    message: "Background tidak ditemukan",
                });
            }

            // Generate presigned URL (valid for 1 hour)
            const url = await getSignedFileUrl(template.background_image_key, 3600);

            res.json({
                success: true,
                data: { url },
            });
        } catch (error) {
            console.error("Error getting background URL:", error);
            res.status(500).json({
                success: false,
                message: "Gagal mengambil URL background",
                error: error.message,
            });
        }
    }

    /**
     * Generate certificate code
     * Format: CERT-{SCHOOL_CODE}-{YEAR}-{SEQUENTIAL_NUMBER}
     */
    generateCertificateCode(schoolCode, year, sequentialNumber) {
        const paddedNumber = String(sequentialNumber).padStart(5, '0');
        return `CERT-${schoolCode}-${year}-${paddedNumber}`;
    }

    /**
     * Preview certificate with sample data
     */
    async previewCertificate(req, res) {
        try {
            const { id } = req.params;
            const school_id = req.user.school_id;

            const template = await CertificateTemplate.findOne({
                where: { id, school_id },
                include: [
                    {
                        model: School,
                        as: "school",
                        attributes: ["id", "name", "code"],
                    },
                ],
            });

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: "Template sertifikat tidak ditemukan",
                });
            }

            // Sample data for preview
            const sampleData = {
                student_name: "Ahmad Rizki Pratama",
                nis: "2024001",
                nisn: "0012345678",
                competition_name: "Olimpiade Matematika Tingkat Nasional",
                competition_level: "Nasional",
                achievement: "Juara 1",
                date: new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                school_name: template.school?.name || "Nama Sekolah",
                principal_name: "Drs. H. Budi Santoso, M.Pd",
                certificate_code: this.generateCertificateCode(
                    template.school?.code || "SCH001",
                    new Date().getFullYear(),
                    1
                ),
            };

            res.json({
                success: true,
                data: {
                    template,
                    sampleData,
                },
            });
        } catch (error) {
            console.error("Error previewing certificate:", error);
            res.status(500).json({
                success: false,
                message: "Gagal membuat preview sertifikat",
                error: error.message,
            });
        }
    }
}

export default new CertificateTemplateController();

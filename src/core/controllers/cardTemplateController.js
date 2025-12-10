import { CardTemplate, School } from "../models/index.js";
import { uploadFile, deleteFile, getSignedFileUrl } from "../../config/minio.js";

class CardTemplateController {
  /**
   * Get all card templates for logged-in user's school
   */
  async getAllTemplates(req, res) {
    try {
      const school_id = req.user.school_id;

      const templates = await CardTemplate.findAll({
        where: { school_id },
        include: [
          {
            model: School,
            as: "school",
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["is_default", "DESC"],
          ["created_at", "DESC"],
        ],
      });

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      console.error("Error getting templates:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data template kartu",
        error: error.message,
      });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      const school_id = req.user.school_id;

      const template = await CardTemplate.findOne({
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
          message: "Template tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      console.error("Error getting template:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data template",
        error: error.message,
      });
    }
  }

  /**
   * Create new card template
   */
  async createTemplate(req, res) {
    try {
      const school_id = req.user.school_id;
      const { name, description, orientation, layout, is_default } = req.body;

      // Validate required fields
      if (!name || !orientation) {
        return res.status(400).json({
          success: false,
          message: "Nama dan orientasi wajib diisi",
        });
      }

      // If this is set as default, unset other defaults
      if (is_default) {
        await CardTemplate.update(
          { is_default: false },
          { where: { school_id, is_default: true } }
        );
      }

      // Handle background image upload if exists
      let background_image = null;
      if (req.file) {
        const uploadResult = await uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          `card-backgrounds/${school_id}`
        );
        background_image = uploadResult.key;
      }

      const template = await CardTemplate.create({
        school_id,
        name,
        description,
        background_image,
        background_fit: req.body.background_fit || "cover",
        orientation: orientation || "portrait",
        card_width: req.body.card_width || 300,
        card_height: req.body.card_height || 450,
        layout: layout ? JSON.parse(layout) : { elements: [] },
        is_default: is_default || false,
      });

      res.status(201).json({
        success: true,
        message: "Template berhasil dibuat",
        data: template,
      });
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({
        success: false,
        message: "Gagal membuat template",
        error: error.message,
      });
    }
  }

  /**
   * Update card template
   */
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const school_id = req.user.school_id;
      const { name, description, orientation, layout, is_default, card_width, card_height, background_fit } = req.body;

      const template = await CardTemplate.findOne({
        where: { id, school_id },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template tidak ditemukan",
        });
      }

      // If this is set as default, unset other defaults
      if (is_default && !template.is_default) {
        await CardTemplate.update(
          { is_default: false },
          { where: { school_id, is_default: true } }
        );
      }

      // Handle background image upload if exists
      let background_image = template.background_image;
      if (req.file) {
        // Delete old background if exists
        if (background_image) {
          try {
            await deleteFile(background_image);
          } catch (err) {
            console.error("Error deleting old background:", err);
          }
        }

        const uploadResult = await uploadFile(
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          `card-backgrounds/${school_id}`
        );
        background_image = uploadResult.key;
      }

      await template.update({
        name: name || template.name,
        description: description !== undefined ? description : template.description,
        background_image,
        background_fit: background_fit || template.background_fit,
        orientation: orientation || template.orientation,
        card_width: card_width || template.card_width,
        card_height: card_height || template.card_height,
        layout: layout ? JSON.parse(layout) : template.layout,
        is_default: is_default !== undefined ? is_default : template.is_default,
      });

      res.json({
        success: true,
        message: "Template berhasil diperbarui",
        data: template,
      });
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui template",
        error: error.message,
      });
    }
  }

  /**
   * Delete card template
   */
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const school_id = req.user.school_id;

      const template = await CardTemplate.findOne({
        where: { id, school_id },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template tidak ditemukan",
        });
      }

      // Delete background image if exists
      if (template.background_image) {
        try {
          await deleteFile(template.background_image);
        } catch (err) {
          console.error("Error deleting background:", err);
        }
      }

      await template.destroy();

      res.json({
        success: true,
        message: "Template berhasil dihapus",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus template",
        error: error.message,
      });
    }
  }

  /**
   * Get default template for school
   */
  async getDefaultTemplate(req, res) {
    try {
      const school_id = req.user.school_id;

      const template = await CardTemplate.findOne({
        where: { school_id, is_default: true },
      });

      if (!template) {
        return res.status(404).json({
          success: false,
          message: "Template default tidak ditemukan",
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      console.error("Error getting default template:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil template default",
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

      const template = await CardTemplate.findOne({
        where: { id, school_id },
      });

      if (!template || !template.background_image) {
        return res.status(404).json({
          success: false,
          message: "Background tidak ditemukan",
        });
      }

      // Generate presigned URL (valid for 1 hour)
      const url = await getSignedFileUrl(template.background_image, 3600);

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
}

export default new CardTemplateController();

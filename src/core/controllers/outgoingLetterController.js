import {
  OutgoingLetter,
  LetterAttachment,
  LetterApproval,
  School,
  User,
} from "../models/index.js";
import { uploadFile, deleteFile } from "../../config/minio.js";
import { Op } from "sequelize";

// Generate auto number for outgoing letter
const generateAutoNumber = async (school_id) => {
  const year = new Date().getFullYear();
  const prefix = `SK/${year}/`;
  
  const lastLetter = await OutgoingLetter.findOne({
    where: {
      school_id,
      auto_number: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['id', 'DESC']]
  });
  
  let nextNumber = 1;
  if (lastLetter && lastLetter.auto_number) {
    const parts = lastLetter.auto_number.split('/');
    const lastNum = parseInt(parts[parts.length - 1]) || 0;
    nextNumber = lastNum + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

// Get all outgoing letters
export const getAllOutgoingLetters = async (req, res) => {
  try {
    const { school_id } = req.user;
    const {
      page = 1,
      limit = 10,
      status,
      classification,
      priority,
      date_from,
      date_to,
      search,
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { school_id };

    if (status) whereClause.status = status;
    if (classification) whereClause.classification = classification;
    if (priority) whereClause.priority = priority;

    if (date_from && date_to) {
      whereClause.letter_date = {
        [Op.between]: [date_from, date_to]
      };
    } else if (date_from) {
      whereClause.letter_date = {
        [Op.gte]: date_from
      };
    } else if (date_to) {
      whereClause.letter_date = {
        [Op.lte]: date_to
      };
    }

    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { recipient: { [Op.like]: `%${search}%` } },
        { letter_number: { [Op.like]: `%${search}%` } },
        { auto_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: letters } = await OutgoingLetter.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["letter_date", "DESC"], ["id", "DESC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
        {
          model: LetterAttachment,
          as: "attachments",
        },
        {
          model: LetterApproval,
          as: "approvals",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            }
          ]
        }
      ],
    });

    res.status(200).json({
      data: letters,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllOutgoingLetters:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get outgoing letter by ID
export const getOutgoingLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
        {
          model: LetterAttachment,
          as: "attachments",
        },
        {
          model: LetterApproval,
          as: "approvals",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            }
          ],
          order: [["created_at", "DESC"]]
        }
      ],
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    res.status(200).json({ data: letter });
  } catch (error) {
    console.error("Error in getOutgoingLetterById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create outgoing letter
export const createOutgoingLetter = async (req, res) => {
  try {
    const { school_id, id: user_id } = req.user;
    const {
      letter_number,
      classification,
      subject,
      recipient,
      letter_date,
      priority,
      description,
    } = req.body;

    if (!subject || !recipient || !letter_date) {
      return res.status(400).json({
        error: "subject, recipient, and letter_date are required",
      });
    }

    const auto_number = await generateAutoNumber(school_id);

    const letter = await OutgoingLetter.create({
      school_id,
      letter_number,
      classification,
      subject,
      recipient,
      letter_date,
      priority: priority || "NORMAL",
      status: "DRAFT",
      auto_number,
      description,
      created_by: user_id,
      updated_by: user_id,
    });

    res.status(201).json({
      message: "Outgoing letter created successfully",
      data: letter,
    });
  } catch (error) {
    console.error("Error in createOutgoingLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update outgoing letter
export const updateOutgoingLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const {
      letter_number,
      classification,
      subject,
      recipient,
      letter_date,
      priority,
      description,
    } = req.body;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    // Only DRAFT and REJECTED can be edited
    if (letter.status !== "DRAFT" && letter.status !== "REJECTED") {
      return res.status(400).json({
        error: "Only DRAFT and REJECTED letters can be edited",
      });
    }

    await letter.update({
      letter_number: letter_number !== undefined ? letter_number : letter.letter_number,
      classification: classification !== undefined ? classification : letter.classification,
      subject: subject || letter.subject,
      recipient: recipient || letter.recipient,
      letter_date: letter_date || letter.letter_date,
      priority: priority || letter.priority,
      description: description !== undefined ? description : letter.description,
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Outgoing letter updated successfully",
      data: letter,
    });
  } catch (error) {
    console.error("Error in updateOutgoingLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Submit for approval
export const submitForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    if (letter.status !== "DRAFT" && letter.status !== "REJECTED") {
      return res.status(400).json({
        error: "Only DRAFT and REJECTED letters can be submitted for approval",
      });
    }

    await letter.update({
      status: "PENDING",
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Letter submitted for approval",
      data: letter,
    });
  } catch (error) {
    console.error("Error in submitForApproval:", error);
    res.status(500).json({ error: error.message });
  }
};

// Approve/Reject letter
export const approveOrRejectLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const { action, notes } = req.body;

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return res.status(400).json({
        error: "action must be either APPROVE or REJECT",
      });
    }

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    if (letter.status !== "PENDING") {
      return res.status(400).json({
        error: "Only PENDING letters can be approved or rejected",
      });
    }

    // Create approval record
    await LetterApproval.create({
      outgoing_id: id,
      user_id,
      action,
      notes,
    });

    // Update letter status
    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    await letter.update({
      status: newStatus,
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: `Letter ${action.toLowerCase()}d successfully`,
      data: letter,
    });
  } catch (error) {
    console.error("Error in approveOrRejectLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Send letter
export const sendLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const { notes } = req.body;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    if (letter.status !== "APPROVED") {
      return res.status(400).json({
        error: "Only APPROVED letters can be sent",
      });
    }

    // Create send record
    await LetterApproval.create({
      outgoing_id: id,
      user_id,
      action: "SEND",
      notes,
    });

    // Update letter status and send_date
    await letter.update({
      status: "SENT",
      send_date: new Date(),
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Letter sent successfully",
      data: letter,
    });
  } catch (error) {
    console.error("Error in sendLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Archive letter
export const archiveLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    if (letter.status !== "SENT") {
      return res.status(400).json({
        error: "Only SENT letters can be archived",
      });
    }

    await letter.update({
      status: "ARCHIVED",
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Letter archived successfully",
      data: letter,
    });
  } catch (error) {
    console.error("Error in archiveLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete outgoing letter
export const deleteOutgoingLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
      include: [
        {
          model: LetterAttachment,
          as: "attachments",
        }
      ]
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    // Only DRAFT and REJECTED can be deleted
    if (letter.status !== "DRAFT" && letter.status !== "REJECTED") {
      return res.status(400).json({
        error: "Only DRAFT and REJECTED letters can be deleted",
      });
    }

    // Delete attachments from storage
    if (letter.attachments && letter.attachments.length > 0) {
      for (const attachment of letter.attachments) {
        try {
          await deleteFile(attachment.file_path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    }

    await letter.destroy();

    res.status(200).json({ message: "Outgoing letter deleted successfully" });
  } catch (error) {
    console.error("Error in deleteOutgoingLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload attachment
export const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;
    const { caption } = req.body;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileName = `letters/outgoing/${Date.now()}-${file.originalname}`;
    
    await uploadFile(fileName, file.buffer, file.mimetype);

    const attachment = await LetterAttachment.create({
      outgoing_id: id,
      file_path: fileName,
      file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      caption,
    });

    res.status(201).json({
      message: "Attachment uploaded successfully",
      data: attachment,
    });
  } catch (error) {
    console.error("Error in uploadAttachment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete attachment
export const deleteAttachment = async (req, res) => {
  try {
    const { id, attachment_id } = req.params;
    const { school_id } = req.user;

    const letter = await OutgoingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Outgoing letter not found" });
    }

    const attachment = await LetterAttachment.findOne({
      where: { id: attachment_id, outgoing_id: id },
    });

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    try {
      await deleteFile(attachment.file_path);
    } catch (err) {
      console.error("Error deleting file from storage:", err);
    }

    await attachment.destroy();

    res.status(200).json({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAttachment:", error);
    res.status(500).json({ error: error.message });
  }
};

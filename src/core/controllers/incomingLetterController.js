import {
  IncomingLetter,
  OutgoingLetter,
  LetterAttachment,
  LetterApproval,
  LetterDisposition,
  School,
  User,
} from "../models/index.js";
import { uploadFile, deleteFile } from "../../config/minio.js";
import { Op } from "sequelize";

// Generate auto number for incoming letter
const generateAutoNumber = async (school_id) => {
  const year = new Date().getFullYear();
  const prefix = `SM/${year}/`;
  
  const lastLetter = await IncomingLetter.findOne({
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

// Get all incoming letters
export const getAllIncomingLetters = async (req, res) => {
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
      whereClause.received_date = {
        [Op.between]: [date_from, date_to]
      };
    } else if (date_from) {
      whereClause.received_date = {
        [Op.gte]: date_from
      };
    } else if (date_to) {
      whereClause.received_date = {
        [Op.lte]: date_to
      };
    }

    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.like]: `%${search}%` } },
        { sender: { [Op.like]: `%${search}%` } },
        { letter_number: { [Op.like]: `%${search}%` } },
        { auto_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: letters } = await IncomingLetter.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["received_date", "DESC"], ["id", "DESC"]],
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
          model: LetterDisposition,
          as: "dispositions",
          include: [
            {
              model: User,
              as: "toUser",
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
    console.error("Error in getAllIncomingLetters:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get incoming letter by ID
export const getIncomingLetterById = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const letter = await IncomingLetter.findOne({
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
          ]
        },
        {
          model: LetterDisposition,
          as: "dispositions",
          include: [
            {
              model: User,
              as: "fromUser",
              attributes: ["id", "name"],
            },
            {
              model: User,
              as: "toUser",
              attributes: ["id", "name"],
            }
          ]
        }
      ],
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
    }

    res.status(200).json({ data: letter });
  } catch (error) {
    console.error("Error in getIncomingLetterById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create incoming letter
export const createIncomingLetter = async (req, res) => {
  try {
    const { school_id, id: user_id } = req.user;
    const {
      letter_number,
      classification,
      subject,
      sender,
      received_date,
      letter_date,
      priority,
      description,
    } = req.body;

    if (!subject || !sender || !received_date) {
      return res.status(400).json({
        error: "subject, sender, and received_date are required",
      });
    }

    const auto_number = await generateAutoNumber(school_id);

    const letter = await IncomingLetter.create({
      school_id,
      letter_number,
      classification,
      subject,
      sender,
      received_date,
      letter_date,
      priority: priority || "NORMAL",
      status: "BARU",
      auto_number,
      description,
      created_by: user_id,
      updated_by: user_id,
    });

    res.status(201).json({
      message: "Incoming letter created successfully",
      data: letter,
    });
  } catch (error) {
    console.error("Error in createIncomingLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update incoming letter
export const updateIncomingLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const {
      letter_number,
      classification,
      subject,
      sender,
      received_date,
      letter_date,
      priority,
      description,
    } = req.body;

    const letter = await IncomingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
    }

    await letter.update({
      letter_number: letter_number !== undefined ? letter_number : letter.letter_number,
      classification: classification !== undefined ? classification : letter.classification,
      subject: subject || letter.subject,
      sender: sender || letter.sender,
      received_date: received_date || letter.received_date,
      letter_date: letter_date !== undefined ? letter_date : letter.letter_date,
      priority: priority || letter.priority,
      description: description !== undefined ? description : letter.description,
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Incoming letter updated successfully",
      data: letter,
    });
  } catch (error) {
    console.error("Error in updateIncomingLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update letter status
export const updateLetterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const { status } = req.body;

    const validStatuses = ["BARU", "DISPOSISI", "PROSES", "SELESAI", "ARSIP"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const letter = await IncomingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
    }

    await letter.update({
      status,
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(200).json({
      message: "Letter status updated successfully",
      data: letter,
    });
  } catch (error) {
    console.error("Error in updateLetterStatus:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete incoming letter
export const deleteIncomingLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const letter = await IncomingLetter.findOne({
      where: { id, school_id },
      include: [
        {
          model: LetterAttachment,
          as: "attachments",
        }
      ]
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
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

    res.status(200).json({ message: "Incoming letter deleted successfully" });
  } catch (error) {
    console.error("Error in deleteIncomingLetter:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload attachment
export const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;
    const { caption } = req.body;

    const letter = await IncomingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileName = `letters/incoming/${Date.now()}-${file.originalname}`;
    
    await uploadFile(fileName, file.buffer, file.mimetype);

    const attachment = await LetterAttachment.create({
      incoming_id: id,
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

    const letter = await IncomingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
    }

    const attachment = await LetterAttachment.findOne({
      where: { id: attachment_id, incoming_id: id },
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

// Create disposition
export const createDisposition = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, id: user_id } = req.user;
    const { to_user_id, instruction, due_date } = req.body;

    if (!to_user_id || !instruction) {
      return res.status(400).json({
        error: "to_user_id and instruction are required",
      });
    }

    const letter = await IncomingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
    }

    const disposition = await LetterDisposition.create({
      incoming_id: id,
      from_user_id: user_id,
      to_user_id,
      instruction,
      status: "PENDING",
      due_date,
      created_by: user_id,
    });

    // Update letter status to DISPOSISI
    await letter.update({
      status: "DISPOSISI",
      updated_by: user_id,
      updated_at: new Date(),
    });

    res.status(201).json({
      message: "Disposition created successfully",
      data: disposition,
    });
  } catch (error) {
    console.error("Error in createDisposition:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update disposition status
export const updateDispositionStatus = async (req, res) => {
  try {
    const { id, disposition_id } = req.params;
    const { school_id, id: user_id } = req.user;
    const { status } = req.body;

    const validStatuses = ["PENDING", "ON_PROGRESS", "DONE"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const letter = await IncomingLetter.findOne({
      where: { id, school_id },
    });

    if (!letter) {
      return res.status(404).json({ error: "Incoming letter not found" });
    }

    const disposition = await LetterDisposition.findOne({
      where: { id: disposition_id, incoming_id: id },
    });

    if (!disposition) {
      return res.status(404).json({ error: "Disposition not found" });
    }

    await disposition.update({ status });

    // If disposition is done, check if all dispositions are done
    if (status === "DONE") {
      const allDispositions = await LetterDisposition.findAll({
        where: { incoming_id: id },
      });

      const allDone = allDispositions.every(d => d.status === "DONE");
      
      if (allDone) {
        await letter.update({
          status: "SELESAI",
          updated_by: user_id,
          updated_at: new Date(),
        });
      } else {
        await letter.update({
          status: "PROSES",
          updated_by: user_id,
          updated_at: new Date(),
        });
      }
    } else if (status === "ON_PROGRESS") {
      await letter.update({
        status: "PROSES",
        updated_by: user_id,
        updated_at: new Date(),
      });
    }

    res.status(200).json({
      message: "Disposition status updated successfully",
      data: disposition,
    });
  } catch (error) {
    console.error("Error in updateDispositionStatus:", error);
    res.status(500).json({ error: error.message });
  }
};

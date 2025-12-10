import {
  Achievement,
  AchievementParticipant,
  AchievementResult,
  AchievementDocument,
  School,
  Student,
  Teacher,
  User,
} from "../models/index.js";
import { uploadFile, deleteFile } from "../../config/minio.js";
import { Op } from "sequelize";

// Get all achievements with pagination
export const getAllAchievements = async (req, res) => {
  try {
    const { school_id } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filter options
    const filters = { school_id };
    if (req.query.event_type) filters.event_type = req.query.event_type;
    if (req.query.level) filters.level = req.query.level;

    const { count, rows } = await Achievement.findAndCountAll({
      where: filters,
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: AchievementParticipant,
          as: "participants",
          include: [
            {
              model: Student,
              as: "student",
              attributes: ["id", "name", "nisn"],
            },
            {
              model: Teacher,
              as: "teacher",
              attributes: ["id", "name", "nip"],
            },
            {
              model: AchievementResult,
              as: "results",
            },
          ],
        },
        {
          model: AchievementDocument,
          as: "documents",
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
    console.error("Error in getAllAchievements:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get achievement by ID
export const getAchievementById = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const achievement = await Achievement.findOne({
      where: { id, school_id },
      include: [
        {
          model: School,
          as: "school",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: AchievementParticipant,
          as: "participants",
          include: [
            {
              model: Student,
              as: "student",
              attributes: ["id", "name", "nisn", "grade_id", "class_id"],
            },
            {
              model: Teacher,
              as: "teacher",
              attributes: ["id", "name", "nip"],
            },
            {
              model: AchievementResult,
              as: "results",
            },
          ],
        },
        {
          model: AchievementDocument,
          as: "documents",
        },
      ],
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    res.status(200).json(achievement);
  } catch (error) {
    console.error("Error in getAchievementById:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create achievement
export const createAchievement = async (req, res) => {
  try {
    const { school_id, user_id } = req.user;
    const {
      title,
      description,
      event_type,
      level,
      organizer,
      event_date,
      location,
    } = req.body;

    // Validasi required fields
    if (!title || !event_type || !level) {
      return res.status(400).json({
        error: "title, event_type, and level are required",
      });
    }

    const achievement = await Achievement.create({
      school_id,
      title,
      description,
      event_type,
      level,
      organizer,
      event_date,
      location,
      created_by: user_id,
    });

    res.status(201).json(achievement);
  } catch (error) {
    console.error("Error in createAchievement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update achievement
export const updateAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;
    const {
      title,
      description,
      event_type,
      level,
      organizer,
      event_date,
      location,
    } = req.body;

    const achievement = await Achievement.findOne({
      where: { id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    await achievement.update({
      title,
      description,
      event_type,
      level,
      organizer,
      event_date,
      location,
    });

    res.status(200).json(achievement);
  } catch (error) {
    console.error("Error in updateAchievement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete achievement
export const deleteAchievement = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id } = req.user;

    const achievement = await Achievement.findOne({
      where: { id, school_id },
      include: [
        {
          model: AchievementDocument,
          as: "documents",
        },
        {
          model: AchievementParticipant,
          as: "participants",
          include: [
            {
              model: AchievementResult,
              as: "results",
            },
          ],
        },
      ],
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Delete all documents from MinIO
    if (achievement.documents && achievement.documents.length > 0) {
      for (const doc of achievement.documents) {
        if (doc.file_key) {
          try {
            await deleteFile(doc.file_key);
          } catch (err) {
            console.error("Error deleting document file:", err);
          }
        }
      }
    }

    // Delete all certificate files from MinIO
    if (achievement.participants && achievement.participants.length > 0) {
      for (const participant of achievement.participants) {
        if (participant.results && participant.results.length > 0) {
          for (const result of participant.results) {
            if (result.certificate_key) {
              try {
                await deleteFile(result.certificate_key);
              } catch (err) {
                console.error("Error deleting certificate file:", err);
              }
            }
          }
        }
      }
    }

    // Delete achievement (will cascade delete participants, results, documents)
    await achievement.destroy();

    res.status(200).json({ message: "Achievement deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAchievement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add participant to achievement
export const addParticipant = async (req, res) => {
  try {
    const { achievement_id } = req.params;
    const { school_id } = req.user;
    const { student_id, teacher_id, role, notes } = req.body;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Validasi: must have either student_id or teacher_id
    if (!student_id && !teacher_id) {
      return res.status(400).json({
        error: "Either student_id or teacher_id is required",
      });
    }

    // Validasi role required
    if (!role) {
      return res.status(400).json({ error: "role is required" });
    }

    const participant = await AchievementParticipant.create({
      achievement_id,
      student_id,
      teacher_id,
      role,
      notes,
    });

    // Get participant with relations
    const participantWithRelations = await AchievementParticipant.findByPk(
      participant.id,
      {
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["id", "name", "nisn"],
          },
          {
            model: Teacher,
            as: "teacher",
            attributes: ["id", "name", "nip"],
          },
        ],
      }
    );

    res.status(201).json(participantWithRelations);
  } catch (error) {
    console.error("Error in addParticipant:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update participant
export const updateParticipant = async (req, res) => {
  try {
    const { achievement_id, participant_id } = req.params;
    const { school_id } = req.user;
    const { student_id, teacher_id, role, notes } = req.body;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    const participant = await AchievementParticipant.findOne({
      where: { id: participant_id, achievement_id },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    await participant.update({
      student_id,
      teacher_id,
      role,
      notes,
    });

    // Get updated participant with relations
    const participantWithRelations = await AchievementParticipant.findByPk(
      participant.id,
      {
        include: [
          {
            model: Student,
            as: "student",
            attributes: ["id", "name", "nisn"],
          },
          {
            model: Teacher,
            as: "teacher",
            attributes: ["id", "name", "nip"],
          },
        ],
      }
    );

    res.status(200).json(participantWithRelations);
  } catch (error) {
    console.error("Error in updateParticipant:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete participant
export const deleteParticipant = async (req, res) => {
  try {
    const { achievement_id, participant_id } = req.params;
    const { school_id } = req.user;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    const participant = await AchievementParticipant.findOne({
      where: { id: participant_id, achievement_id },
      include: [
        {
          model: AchievementResult,
          as: "results",
        },
      ],
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    // Delete certificate files from MinIO
    if (participant.results && participant.results.length > 0) {
      for (const result of participant.results) {
        if (result.certificate_key) {
          try {
            await deleteFile(result.certificate_key);
          } catch (err) {
            console.error("Error deleting certificate file:", err);
          }
        }
      }
    }

    await participant.destroy();

    res.status(200).json({ message: "Participant deleted successfully" });
  } catch (error) {
    console.error("Error in deleteParticipant:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add result to participant
export const addResult = async (req, res) => {
  try {
    const { achievement_id, participant_id } = req.params;
    const { school_id } = req.user;
    const { rank, score, category, notes } = req.body;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Validasi participant exists
    const participant = await AchievementParticipant.findOne({
      where: { id: participant_id, achievement_id },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const result = await AchievementResult.create({
      participant_id,
      rank,
      score,
      category,
      notes,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error in addResult:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update result
export const updateResult = async (req, res) => {
  try {
    const { achievement_id, participant_id, result_id } = req.params;
    const { school_id } = req.user;
    const { rank, score, category, notes } = req.body;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Validasi participant exists
    const participant = await AchievementParticipant.findOne({
      where: { id: participant_id, achievement_id },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const result = await AchievementResult.findOne({
      where: { id: result_id, participant_id },
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    await result.update({
      rank,
      score,
      category,
      notes,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateResult:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete result
export const deleteResult = async (req, res) => {
  try {
    const { achievement_id, participant_id, result_id } = req.params;
    const { school_id } = req.user;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Validasi participant exists
    const participant = await AchievementParticipant.findOne({
      where: { id: participant_id, achievement_id },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const result = await AchievementResult.findOne({
      where: { id: result_id, participant_id },
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    // Delete certificate file from MinIO if exists
    if (result.certificate_key) {
      try {
        await deleteFile(result.certificate_key);
      } catch (err) {
        console.error("Error deleting certificate file:", err);
      }
    }

    await result.destroy();

    res.status(200).json({ message: "Result deleted successfully" });
  } catch (error) {
    console.error("Error in deleteResult:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload certificate for result
export const uploadCertificate = async (req, res) => {
  try {
    const { achievement_id, participant_id, result_id } = req.params;
    const { school_id } = req.user;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Validasi participant exists
    const participant = await AchievementParticipant.findOne({
      where: { id: participant_id, achievement_id },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const result = await AchievementResult.findOne({
      where: { id: result_id, participant_id },
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    // Delete old certificate if exists
    if (result.certificate_key) {
      try {
        await deleteFile(result.certificate_key);
      } catch (err) {
        console.error("Error deleting old certificate:", err);
      }
    }

    // Upload to MinIO
    const uploadResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "achievements/certificates"
    );

    // Update result
    await result.update({
      certificate_file: uploadResult.url,
      certificate_key: uploadResult.key,
    });

    res.status(200).json({
      message: "Certificate uploaded successfully",
      certificate_file: uploadResult.url,
    });
  } catch (error) {
    console.error("Error in uploadCertificate:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete certificate
export const deleteCertificate = async (req, res) => {
  try {
    const { achievement_id, participant_id, result_id } = req.params;
    const { school_id } = req.user;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Validasi participant exists
    const participant = await AchievementParticipant.findOne({
      where: { id: participant_id, achievement_id },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const result = await AchievementResult.findOne({
      where: { id: result_id, participant_id },
    });

    if (!result) {
      return res.status(404).json({ error: "Result not found" });
    }

    if (!result.certificate_key) {
      return res.status(404).json({ error: "No certificate found" });
    }

    // Delete from MinIO
    try {
      await deleteFile(result.certificate_key);
    } catch (err) {
      console.error("Error deleting certificate file:", err);
    }

    // Update result
    await result.update({
      certificate_file: null,
      certificate_key: null,
    });

    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCertificate:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload document for achievement
export const uploadDocument = async (req, res) => {
  try {
    const { achievement_id } = req.params;
    const { school_id } = req.user;
    const { caption, file_type } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    // Upload to MinIO
    const uploadResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      "achievements/documents"
    );

    // Create document record
    const document = await AchievementDocument.create({
      achievement_id,
      file_path: uploadResult.url,
      file_key: uploadResult.key,
      caption,
      file_type: file_type || "document",
    });

    res.status(201).json(document);
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { achievement_id, document_id } = req.params;
    const { school_id } = req.user;

    // Validasi achievement exists and belongs to school
    const achievement = await Achievement.findOne({
      where: { id: achievement_id, school_id },
    });

    if (!achievement) {
      return res.status(404).json({ error: "Achievement not found" });
    }

    const document = await AchievementDocument.findOne({
      where: { id: document_id, achievement_id },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Delete from MinIO
    if (document.file_key) {
      try {
        await deleteFile(document.file_key);
      } catch (err) {
        console.error("Error deleting document file:", err);
      }
    }

    await document.destroy();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error in deleteDocument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get achievement statistics
export const getAchievementStatistics = async (req, res) => {
  try {
    const { school_id } = req.user;
    const { year, month } = req.query;

    // Build where clause
    const whereClause = { school_id };

    // Filter by year and/or month
    if (year) {
      if (month) {
        // Specific month and year
        const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of month
        
        whereClause.event_date = {
          [Op.between]: [startDate, endDate]
        };
      } else {
        // Whole year
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31`);
        
        whereClause.event_date = {
          [Op.between]: [startDate, endDate]
        };
      }
    }

    // Get all achievements with participants
    const achievements = await Achievement.findAll({
      where: whereClause,
      include: [
        {
          model: AchievementParticipant,
          as: "participants",
          include: [
            {
              model: Student,
              as: "student",
              attributes: ["id", "name", "nisn"],
            },
            {
              model: Teacher,
              as: "teacher",
              attributes: ["id", "name", "nip"],
            },
            {
              model: AchievementResult,
              as: "results",
            },
          ],
        },
      ],
      order: [["event_date", "DESC"]],
    });

    // Calculate statistics
    const stats = {
      total: achievements.length,
      totalParticipants: 0,
      studentParticipants: 0,
      teacherParticipants: 0,
      byEventType: {},
      byLevel: {},
      byMonth: {},
      topRanks: {},
      achievementsWithResults: 0,
      averageParticipantsPerEvent: 0,
    };

    // Initialize event types
    const eventTypes = ['ACADEMIC', 'SPORTS', 'ARTS', 'SCIENCE', 'TECHNOLOGY', 'SOCIAL', 'OTHER'];
    eventTypes.forEach(type => stats.byEventType[type] = 0);

    // Initialize levels
    const levels = ['SCHOOL', 'DISTRICT', 'CITY', 'PROVINCE', 'NATIONAL', 'INTERNATIONAL'];
    levels.forEach(level => stats.byLevel[level] = 0);

    let totalParticipantsCount = 0;
    let hasResults = false;

    // Process achievements
    achievements.forEach(achievement => {
      // Count by event type
      stats.byEventType[achievement.event_type] = (stats.byEventType[achievement.event_type] || 0) + 1;

      // Count by level
      stats.byLevel[achievement.level] = (stats.byLevel[achievement.level] || 0) + 1;

      // Count by month
      if (achievement.event_date) {
        const date = new Date(achievement.event_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
      }

      // Count participants
      if (achievement.participants && achievement.participants.length > 0) {
        totalParticipantsCount += achievement.participants.length;
        stats.totalParticipants += achievement.participants.length;

        achievement.participants.forEach(participant => {
          if (participant.student_id) {
            stats.studentParticipants++;
          }
          if (participant.teacher_id) {
            stats.teacherParticipants++;
          }

          // Count ranks from results
          if (participant.results && participant.results.length > 0) {
            hasResults = true;
            participant.results.forEach(result => {
              if (result.rank) {
                stats.topRanks[result.rank] = (stats.topRanks[result.rank] || 0) + 1;
              }
            });
          }
        });
      }

      // Check if achievement has results
      if (hasResults) {
        stats.achievementsWithResults++;
        hasResults = false;
      }
    });

    // Calculate average participants per event
    if (achievements.length > 0) {
      stats.averageParticipantsPerEvent = Math.round((totalParticipantsCount / achievements.length) * 10) / 10;
    }

    // Sort and organize top ranks
    stats.topRanks = Object.entries(stats.topRanks)
      .sort((a, b) => {
        // Try to sort numerically if possible
        const numA = parseInt(a[0]);
        const numB = parseInt(b[0]);
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a[0].localeCompare(b[0]);
      })
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    // Sort months
    const sortedMonths = {};
    Object.keys(stats.byMonth).sort().forEach(key => {
      sortedMonths[key] = stats.byMonth[key];
    });
    stats.byMonth = sortedMonths;

    res.status(200).json({ data: stats });
  } catch (error) {
    console.error("Error in getAchievementStatistics:", error);
    res.status(500).json({ error: error.message });
  }
};

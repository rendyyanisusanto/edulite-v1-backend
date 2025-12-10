import { 
  RewardLevel, 
  RewardType, 
  RewardAction, 
  StudentReward,
  School,
  Student,
  User,
  Grade,
  ClassRoom
} from "../models/index.js";
import { uploadFile, deleteFile } from "../../config/minio.js";
import { Op } from "sequelize";

// ==================== REWARD LEVELS ====================

// Get all reward levels
export const getAllRewardLevels = async (req, res) => {
  try {
    const { school_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: levels } = await RewardLevel.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['min_point', 'ASC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: levels,
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
    console.error("Error fetching reward levels:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get single reward level by ID
export const getRewardLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const level = await RewardLevel.findByPk(id, {
      include: [
        {
          model: School,
          as: "school",
        },
      ],
    });

    if (!level) {
      return res.status(404).json({ message: "Reward level not found" });
    }

    res.json(level);
  } catch (error) {
    console.error("Error fetching reward level:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Create reward level
export const createRewardLevel = async (req, res) => {
  try {
    const { school_id, name, min_point, max_point } = req.body;

    if (!school_id || !name || min_point === undefined || max_point === undefined) {
      return res.status(400).json({ message: "school_id, name, min_point, and max_point are required" });
    }

    const level = await RewardLevel.create({
      school_id,
      name,
      min_point,
      max_point,
    });

    res.status(201).json(level);
  } catch (error) {
    console.error("Error creating reward level:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update reward level
export const updateRewardLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, name, min_point, max_point } = req.body;

    const level = await RewardLevel.findByPk(id);
    if (!level) {
      return res.status(404).json({ message: "Reward level not found" });
    }

    await level.update({
      school_id: school_id !== undefined ? school_id : level.school_id,
      name: name !== undefined ? name : level.name,
      min_point: min_point !== undefined ? min_point : level.min_point,
      max_point: max_point !== undefined ? max_point : level.max_point,
    });

    res.json(level);
  } catch (error) {
    console.error("Error updating reward level:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete reward level
export const deleteRewardLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const level = await RewardLevel.findByPk(id);

    if (!level) {
      return res.status(404).json({ message: "Reward level not found" });
    }

    await level.destroy();
    res.json({ message: "Reward level deleted successfully" });
  } catch (error) {
    console.error("Error deleting reward level:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ==================== REWARD TYPES ====================

// Get all reward types
export const getAllRewardTypes = async (req, res) => {
  try {
    const { school_id, level_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;
    if (level_id) where.level_id = level_id;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: types } = await RewardType.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['id', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: types,
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
    console.error("Error fetching reward types:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get single reward type by ID
export const getRewardTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await RewardType.findByPk(id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
    });

    if (!type) {
      return res.status(404).json({ message: "Reward type not found" });
    }

    res.json(type);
  } catch (error) {
    console.error("Error fetching reward type:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Create reward type
export const createRewardType = async (req, res) => {
  try {
    const { school_id, name, point, level_id, description } = req.body;

    if (!school_id || !name || !point || !level_id) {
      return res.status(400).json({ message: "school_id, name, point, and level_id are required" });
    }

    const type = await RewardType.create({
      school_id,
      name,
      point,
      level_id,
      description: description || null,
    });

    const typeWithLevel = await RewardType.findByPk(type.id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
    });

    res.status(201).json(typeWithLevel);
  } catch (error) {
    console.error("Error creating reward type:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update reward type
export const updateRewardType = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, name, point, level_id, description } = req.body;

    const type = await RewardType.findByPk(id);
    if (!type) {
      return res.status(404).json({ message: "Reward type not found" });
    }

    await type.update({
      school_id: school_id !== undefined ? school_id : type.school_id,
      name: name !== undefined ? name : type.name,
      point: point !== undefined ? point : type.point,
      level_id: level_id !== undefined ? level_id : type.level_id,
      description: description !== undefined ? description : type.description,
    });

    const updatedType = await RewardType.findByPk(id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
    });

    res.json(updatedType);
  } catch (error) {
    console.error("Error updating reward type:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete reward type
export const deleteRewardType = async (req, res) => {
  try {
    const { id } = req.params;
    const type = await RewardType.findByPk(id);

    if (!type) {
      return res.status(404).json({ message: "Reward type not found" });
    }

    await type.destroy();
    res.json({ message: "Reward type deleted successfully" });
  } catch (error) {
    console.error("Error deleting reward type:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ==================== REWARD ACTIONS ====================
// Get all reward actions
export const getAllRewardActions = async (req, res) => {
  try {
    const { school_id, level_id, page = 1, limit = 10 } = req.query;
    const where = {};
    if (school_id) where.school_id = school_id;
    if (level_id) where.level_id = level_id;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: actions } = await RewardAction.findAndCountAll({
      where,
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['id', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: actions,
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
    console.error("Error fetching reward actions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get single reward action by ID
export const getRewardActionById = async (req, res) => {
  try {
    const { id } = req.params;
    const action = await RewardAction.findByPk(id, {
      include: [
        {
          model: School,
          as: "school",
        },
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
    });

    if (!action) {
      return res.status(404).json({ message: "Reward action not found" });
    }

    res.json(action);
  } catch (error) {
    console.error("Error fetching reward action:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
// Create reward action
export const createRewardAction = async (req, res) => {
  try {
    const { school_id, action_name, level_id } = req.body;

    if (!school_id || !action_name || !level_id) {
      return res.status(400).json({ message: "school_id, action_name, and level_id are required" });
    }

    const action = await RewardAction.create({
      school_id,
      action_name,
      level_id,
    });
    
    if (!action_name || !level_id) {
      return res.status(400).json({ message: "Action name and level_id are required" });
    }


    const actionWithLevel = await RewardAction.findByPk(action.id, {
      include: [
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
    });

    res.status(201).json(actionWithLevel);
  } catch (error) {
    console.error("Error creating reward action:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update reward action
export const updateRewardAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_id, action_name, level_id } = req.body;

    const action = await RewardAction.findByPk(id);
    if (!action) {
      return res.status(404).json({ message: "Reward action not found" });
    }

    await action.update({
      school_id: school_id !== undefined ? school_id : action.school_id,
      action_name: action_name !== undefined ? action_name : action.action_name,
      level_id: level_id !== undefined ? level_id : action.level_id,
    });

    const updatedAction = await RewardAction.findByPk(id, {
      include: [
        {
          model: RewardLevel,
          as: "rewardLevel",
        },
      ],
    });

    res.json(updatedAction);
  } catch (error) {
    console.error("Error updating reward action:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete reward action
export const deleteRewardAction = async (req, res) => {
  try {
    const { id } = req.params;
    const action = await RewardAction.findByPk(id);

    if (!action) {
      return res.status(404).json({ message: "Reward action not found" });
    }

    await action.destroy();
    res.json({ message: "Reward action deleted successfully" });
  } catch (error) {
    console.error("Error deleting reward action:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// ==================== STUDENT REWARDS ====================

// Get all student rewards
export const getAllStudentRewards = async (req, res) => {
  try {
    const { student_id, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (student_id) where.student_id = student_id;
    if (status) where.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: rewards } = await StudentReward.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "nisn", "grade_id", "class_id"],
          include: [
            { model: Grade, as: "grade", attributes: ["id", "name"] },
            { model: ClassRoom, as: "class", attributes: ["id", "name"] },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          attributes: ["id", "name", "point", "level_id"],
          include: [{ model: RewardLevel, as: "rewardLevel", attributes: ["id", "name"] }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          attributes: ["id", "action_name", "level_id"],
          include: [{ model: RewardLevel, as: "rewardLevel", attributes: ["id", "name"] }],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
        },
      ],
      limit: limitNum,
      offset: offset,
      order: [['date', 'DESC'], ['id', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: rewards,
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
    console.error("Error fetching student rewards:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get single student reward by ID
export const getStudentRewardById = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await StudentReward.findByPk(id, {
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "name", "nisn", "grade_id", "class_id"],
          include: [
            { model: Grade, as: "grade", attributes: ["id", "name"] },
            { model: ClassRoom, as: "class", attributes: ["id", "name"] },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          attributes: ["id", "name", "point", "level_id"],
          include: [{ model: RewardLevel, as: "rewardLevel", attributes: ["id", "name"] }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          attributes: ["id", "action_name", "level_id"],
          include: [{ model: RewardLevel, as: "rewardLevel", attributes: ["id", "name"] }],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!reward) {
      return res.status(404).json({ message: "Student reward not found" });
    }

    res.json(reward);
  } catch (error) {
    console.error("Error fetching student reward:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Create student reward
export const createStudentReward = async (req, res) => {
  try {
    console.log("Creating reward - req.user:", req.user);
    console.log("Authorization header:", req.headers.authorization);

    if (!req.user || !req.user.user_id) {
      console.log("ERROR: User not authenticated", { user: req.user });
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { student_id, type_id, action_id, date, location, description } = req.body;

    if (!student_id || !type_id || !date) {
      return res.status(400).json({ message: "Student ID, type ID, and date are required" });
    }

    const reward = await StudentReward.create({
      student_id,
      type_id,
      action_id: action_id || null,
      date,
      location: location || null,
      description: description || null,
      status: "NEW",
      created_by: req.user.user_id,
    });

    const rewardWithDetails = await StudentReward.findByPk(reward.id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: Grade, as: "grade" },
            { model: ClassRoom, as: "class" },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json(rewardWithDetails);
  } catch (error) {
    console.error("Error creating student reward:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update student reward
export const updateStudentReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id, type_id, action_id, date, location, description, status } = req.body;

    const reward = await StudentReward.findByPk(id);
    if (!reward) {
      return res.status(404).json({ message: "Student reward not found" });
    }

    await reward.update({
      student_id: student_id !== undefined ? student_id : reward.student_id,
      type_id: type_id !== undefined ? type_id : reward.type_id,
      action_id: action_id !== undefined ? action_id : reward.action_id,
      date: date !== undefined ? date : reward.date,
      location: location !== undefined ? location : reward.location,
      description: description !== undefined ? description : reward.description,
      status: status !== undefined ? status : reward.status,
    });

    const updatedReward = await StudentReward.findByPk(id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: Grade, as: "grade" },
            { model: ClassRoom, as: "class" },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json(updatedReward);
  } catch (error) {
    console.error("Error updating student reward:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete student reward
export const deleteStudentReward = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await StudentReward.findByPk(id);

    if (!reward) {
      return res.status(404).json({ message: "Student reward not found" });
    }

    // Delete evidence file if exists
    if (reward.evidence_file) {
      try {
        await deleteFile("rewards", reward.evidence_file);
      } catch (error) {
        console.error("Error deleting evidence file:", error);
      }
    }

    await reward.destroy();
    res.json({ message: "Student reward deleted successfully" });
  } catch (error) {
    console.error("Error deleting student reward:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Upload evidence file
export const uploadRewardEvidence = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await StudentReward.findByPk(id);

    if (!reward) {
      return res.status(404).json({ message: "Student reward not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Delete old file if exists
    if (reward.evidence_file) {
      try {
        await deleteFile("rewards", reward.evidence_file);
      } catch (error) {
        console.error("Error deleting old evidence file:", error);
      }
    }

    // Upload new file
    const fileName = await uploadFile(req.file, "rewards");
    await reward.update({ evidence_file: fileName });

    const updatedReward = await StudentReward.findByPk(id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: Grade, as: "grade" },
            { model: ClassRoom, as: "class" },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
      ],
    });

    res.json(updatedReward);
  } catch (error) {
    console.error("Error uploading reward evidence:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Approve reward
export const approveReward = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await StudentReward.findByPk(id);

    if (!reward) {
      return res.status(404).json({ message: "Student reward not found" });
    }

    if (reward.status !== "NEW") {
      return res.status(400).json({ message: "Only NEW rewards can be approved" });
    }

    await reward.update({
      status: "APPROVED",
      approved_by: req.user.user_id,
      approved_at: new Date(),
    });

    const updatedReward = await StudentReward.findByPk(id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: Grade, as: "grade" },
            { model: ClassRoom, as: "class" },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json(updatedReward);
  } catch (error) {
    console.error("Error approving reward:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Reject reward
export const rejectReward = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const reward = await StudentReward.findByPk(id);
    if (!reward) {
      return res.status(404).json({ message: "Student reward not found" });
    }

    if (reward.status !== "NEW") {
      return res.status(400).json({ message: "Only NEW rewards can be rejected" });
    }

    await reward.update({
      status: "REJECTED",
      approved_by: req.user.user_id,
      approved_at: new Date(),
      rejection_reason,
    });

    const updatedReward = await StudentReward.findByPk(id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: Grade, as: "grade" },
            { model: ClassRoom, as: "class" },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: User,
          as: "approver",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json(updatedReward);
  } catch (error) {
    console.error("Error rejecting reward:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Mark reward as actioned
export const actionReward = async (req, res) => {
  try {
    const { id } = req.params;
    const reward = await StudentReward.findByPk(id);

    if (!reward) {
      return res.status(404).json({ message: "Student reward not found" });
    }

    if (reward.status !== "APPROVED") {
      return res.status(400).json({ message: "Only APPROVED rewards can be actioned" });
    }

    await reward.update({ status: "ACTIONED" });

    const updatedReward = await StudentReward.findByPk(id, {
      include: [
        {
          model: Student,
          as: "student",
          include: [
            { model: Grade, as: "grade" },
            { model: ClassRoom, as: "class" },
          ],
        },
        {
          model: RewardType,
          as: "rewardType",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
        {
          model: RewardAction,
          as: "rewardAction",
          include: [{ model: RewardLevel, as: "rewardLevel" }],
        },
      ],
    });

    res.json(updatedReward);
  } catch (error) {
    console.error("Error actioning reward:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

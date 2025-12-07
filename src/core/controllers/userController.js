import { User, School, Student, Teacher } from "../models/index.js";
import bcrypt from "bcrypt";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: users } = await User.findAndCountAll({
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      attributes: { exclude: ["password_hash"] },
      limit: limitNum,
      offset: offset,
    });

    const totalPages = Math.ceil(count / limitNum);

    res.json({
      data: users,
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

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: School,
          as: "school",
        },
      ],
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { school_id, name, email, password, role, is_active } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      school_id,
      name,
      email,
      password_hash: password, // akan di-hash otomatis di model
      role: role || "admin",
      is_active: is_active !== undefined ? is_active : true,
    });

    const userResponse = user.toJSON();
    delete userResponse.password_hash;
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { school_id, name, email, password, role, is_active } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      school_id,
      name,
      email,
      role,
      is_active,
      updated_at: new Date(),
    };

    // Only update password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);
    const userResponse = user.toJSON();
    delete userResponse.password_hash;
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

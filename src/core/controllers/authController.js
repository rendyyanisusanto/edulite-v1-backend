import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, Session } from "../models/index.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Wrong password" });

    // Generate tokens
    const access_token = jwt.sign(
      { user_id: user.id, school_id: user.school_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refresh_token = jwt.sign(
      { user_id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Save session
    const expires_at = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    await Session.create({
      user_id: user.id,
      access_token,
      refresh_token,
      expires_at,
    });

    // Update last login
    await user.update({ last_login: new Date() });

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    return res.json({
      access_token,
      refresh_token,
      expires_at,
      user: userResponse,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      await Session.destroy({ where: { access_token: token } });
    }
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
    const session = await Session.findOne({ where: { refresh_token } });

    if (!session) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findByPk(decoded.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new access token
    const new_access_token = jwt.sign(
      { user_id: user.id, school_id: user.school_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const expires_at = new Date(Date.now() + 2 * 60 * 60 * 1000);

    // Update session
    await session.update({
      access_token: new_access_token,
      expires_at,
    });

    return res.json({
      access_token: new_access_token,
      expires_at,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

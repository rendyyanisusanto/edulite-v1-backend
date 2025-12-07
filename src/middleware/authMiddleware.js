import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Session, User } from "../core/models/index.js";

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "Token required" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists
    const session = await Session.findOne({ where: { access_token: token } });
    if (!session) {
      return res.status(401).json({ message: "Session not found" });
    }

    // Check if token expired
    if (new Date() > session.expires_at) {
      return res.status(401).json({ message: "Token expired" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware untuk role-based access
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

// Middleware untuk memastikan user mengakses data sekolahnya sendiri
export const checkSchoolAccess = async (req, res, next) => {
  try {
    const { school_id } = req.params;
    
    // SuperAdmin bisa akses semua sekolah
    if (req.user.role === "superadmin") {
      return next();
    }

    // User lain hanya bisa akses sekolahnya sendiri
    if (req.user.school_id != school_id) {
      return res.status(403).json({ message: "Access denied to this school" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

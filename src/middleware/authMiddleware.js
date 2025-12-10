import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Session, User } from "../core/models/index.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log('=== verifyToken called ===');
    console.log('Authorization header:', authHeader);
    
    const token = authHeader?.split(" ")[1];
    if (!token) {
      console.log('ERROR: No token provided');
      return res.status(403).json({ message: "Token required" });
    }

    console.log('Token exists, verifying...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.user_id, role: decoded.role, schoolId: decoded.school_id });

    // Check if session exists
    const session = await Session.findOne({ where: { access_token: token } });
    if (!session) {
      console.log('ERROR: Session not found in database');
      return res.status(401).json({ message: "Session not found - please login again" });
    }

    console.log('Session found, expires at:', session.expires_at);

    // Check if token expired
    if (new Date() > session.expires_at) {
      console.log('ERROR: Token expired at', session.expires_at);
      return res.status(401).json({ message: "Token expired - please login again" });
    }

    req.user = decoded;
    console.log('SUCCESS: req.user set:', { id: req.user.user_id, role: req.user.role });
    next();
  } catch (err) {
    console.log('ERROR in verifyToken:', err.message);
    return res.status(401).json({ message: "Invalid token: " + err.message });
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

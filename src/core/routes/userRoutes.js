import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Get all users (admin and above)
router.get("/", verifyToken, authorize("superadmin", "admin"), getAllUsers);

// Get user by ID
router.get("/:id", verifyToken, getUserById);

// Create user (admin and above)
router.post("/", verifyToken, authorize("superadmin", "admin"), createUser);

// Update user
router.put("/:id", verifyToken, updateUser);

// Delete user (admin and above)
router.delete("/:id", verifyToken, authorize("superadmin", "admin"), deleteUser);

export default router;

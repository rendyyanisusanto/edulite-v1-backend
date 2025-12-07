import express from "express";
import { login, logout, refreshToken, getProfile } from "../controllers/authController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", verifyToken, logout);
router.post("/refresh", refreshToken);
router.get("/profile", verifyToken, getProfile);

export default router;

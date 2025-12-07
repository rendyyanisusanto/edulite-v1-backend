import express from "express";
import {
  getAllGuestbooks,
  getGuestbookById,
  createGuestbook,
  updateGuestbook,
  checkoutGuest,
  deleteGuestbook,
  getGuestbookStatistics,
} from "../controllers/guestbookController.js";
import { verifyToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Guestbook routes
router.get("/", verifyToken, getAllGuestbooks);
router.get("/statistics", verifyToken, getGuestbookStatistics);
router.get("/:id", verifyToken, getGuestbookById);
router.post("/", verifyToken, createGuestbook);
router.put("/:id", verifyToken, updateGuestbook);
router.post("/:id/checkout", verifyToken, checkoutGuest);
router.delete("/:id", verifyToken, deleteGuestbook);

export default router;

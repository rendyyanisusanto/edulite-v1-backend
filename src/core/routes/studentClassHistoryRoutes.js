import express from "express";
import {
  getAllStudentClassHistory,
  getStudentClassHistoryById,
  createStudentClassHistory,
  updateStudentClassHistory,
  deleteStudentClassHistory,
  bulkAssignStudentsToClass,
} from "../controllers/studentClassHistoryController.js";
import { verifyToken, authorize } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getAllStudentClassHistory);
router.get("/:id", verifyToken, getStudentClassHistoryById);
router.post("/", verifyToken, createStudentClassHistory);
router.post("/bulk-assign", verifyToken, bulkAssignStudentsToClass);
router.put("/:id", verifyToken, updateStudentClassHistory);
router.delete("/:id", verifyToken, deleteStudentClassHistory);


export default router;

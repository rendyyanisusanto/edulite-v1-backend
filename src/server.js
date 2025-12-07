import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";

// Import routes
import authRoutes from "./core/routes/authRoutes.js";
import schoolRoutes from "./core/routes/schoolRoutes.js";
import userRoutes from "./core/routes/userRoutes.js";
import studentRoutes from "./core/routes/studentRoutes.js";
import teacherRoutes from "./core/routes/teacherRoutes.js";
import roleRoutes from "./core/routes/roleRoutes.js";
import appRoutes from "./core/routes/appRoutes.js";
import schoolAppRoutes from "./core/routes/schoolAppRoutes.js";
import academicYearRoutes from "./core/routes/academicYearRoutes.js";
import gradeRoutes from "./core/routes/gradeRoutes.js";
import departmentRoutes from "./core/routes/departmentRoutes.js";
import classRoutes from "./core/routes/classRoutes.js";
import studentMutationRoutes from "./core/routes/studentMutationRoutes.js";
import studentClassHistoryRoutes from "./core/routes/studentClassHistoryRoutes.js";
import achievementRoutes from "./core/routes/achievementRoutes.js";
import guestbookRoutes from "./core/routes/guestbookRoutes.js";
import incomingLetterRoutes from "./core/routes/incomingLetterRoutes.js";
import outgoingLetterRoutes from "./core/routes/outgoingLetterRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/apps", appRoutes);
app.use("/api/school-apps", schoolAppRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/student-mutations", studentMutationRoutes);
app.use("/api/student-class-history", studentClassHistoryRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/guestbooks", guestbookRoutes);
app.use("/api/incoming-letters", incomingLetterRoutes);
app.use("/api/outgoing-letters", outgoingLetterRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.log("❌ DB error:", err));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Schools: http://localhost:${PORT}/api/schools`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Students: http://localhost:${PORT}/api/students`);
  console.log(`   - Teachers: http://localhost:${PORT}/api/teachers`);
  console.log(`   - Roles: http://localhost:${PORT}/api/roles`);
  console.log(`   - Apps: http://localhost:${PORT}/api/apps`);
  console.log(`   - School Apps: http://localhost:${PORT}/api/school-apps`);
  console.log(`   - Academic Years: http://localhost:${PORT}/api/academic-years`);
  console.log(`   - Grades: http://localhost:${PORT}/api/grades`);
  console.log(`   - Departments: http://localhost:${PORT}/api/departments`);
  console.log(`   - Classes: http://localhost:${PORT}/api/classes`);
  console.log(`   - Student Mutations: http://localhost:${PORT}/api/student-mutations`);
  console.log(`   - Student Class History: http://localhost:${PORT}/api/student-class-history`);
  console.log(`   - Achievements: http://localhost:${PORT}/api/achievements`);
  console.log(`   - Guestbooks: http://localhost:${PORT}/api/guestbooks`);
  console.log(`   - Incoming Letters: http://localhost:${PORT}/api/incoming-letters`);
  console.log(`   - Outgoing Letters: http://localhost:${PORT}/api/outgoing-letters`);
});

import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../../config/database.js";

// Import semua models
import UserModel from "./user.model.js";
import SchoolModel from "./school.model.js";
import StudentModel from "./student.model.js";
import TeacherModel from "./teacher.model.js";
import RoleModel from "./role.model.js";
import UserRoleModel from "./userRole.model.js";
import AppModel from "./app.model.js";
import SchoolAppModel from "./schoolApp.model.js";
import SessionModel from "./session.model.js";
import AcademicYearModel from "./academicYear.model.js";
import GradeModel from "./grade.model.js";
import DepartmentModel from "./department.model.js";
import ClassModel from "./class.model.js";
import StudentMutationModel from "./studentMutation.model.js";
import StudentClassHistoryModel from "./studentClassHistory.model.js";
import AchievementModel from "./achievement.model.js";
import AchievementParticipantModel from "./achievementParticipant.model.js";
import AchievementResultModel from "./achievementResult.model.js";
import AchievementDocumentModel from "./achievementDocument.model.js";
import GuestbookModel from "./Guestbook.js";
import IncomingLetterModel from "./IncomingLetter.js";
import OutgoingLetterModel from "./OutgoingLetter.js";
import LetterAttachmentModel from "./LetterAttachment.js";
import LetterApprovalModel from "./LetterApproval.js";
import LetterDispositionModel from "./LetterDisposition.js";

// Inisialisasi models
const User = UserModel(sequelize, DataTypes);
const School = SchoolModel(sequelize, DataTypes);
const Student = StudentModel(sequelize, DataTypes);
const Teacher = TeacherModel(sequelize, DataTypes);
const Role = RoleModel(sequelize, DataTypes);
const UserRole = UserRoleModel(sequelize, DataTypes);
const App = AppModel(sequelize, DataTypes);
const SchoolApp = SchoolAppModel(sequelize, DataTypes);
const Session = SessionModel(sequelize, DataTypes);
const AcademicYear = AcademicYearModel(sequelize, DataTypes);
const Grade = GradeModel(sequelize, DataTypes);
const Department = DepartmentModel(sequelize, DataTypes);
const ClassRoom = ClassModel(sequelize, DataTypes);
const StudentMutation = StudentMutationModel(sequelize, DataTypes);
const StudentClassHistory = StudentClassHistoryModel(sequelize, DataTypes);
const Achievement = AchievementModel(sequelize, DataTypes);
const AchievementParticipant = AchievementParticipantModel(sequelize, DataTypes);
const AchievementResult = AchievementResultModel(sequelize, DataTypes);
const AchievementDocument = AchievementDocumentModel(sequelize, DataTypes);
const Guestbook = GuestbookModel(sequelize, DataTypes);
const IncomingLetter = IncomingLetterModel(sequelize, DataTypes);
const OutgoingLetter = OutgoingLetterModel(sequelize, DataTypes);
const LetterAttachment = LetterAttachmentModel(sequelize, DataTypes);
const LetterApproval = LetterApprovalModel(sequelize, DataTypes);
const LetterDisposition = LetterDispositionModel(sequelize, DataTypes);

// Setup associations
const models = {
  User,
  School,
  Student,
  Teacher,
  Role,
  UserRole,
  App,
  SchoolApp,
  Session,
  AcademicYear,
  Grade,
  Department,
  ClassRoom,
  StudentMutation,
  StudentClassHistory,
  Achievement,
  AchievementParticipant,
  AchievementResult,
  AchievementDocument,
  Guestbook,
  IncomingLetter,
  OutgoingLetter,
  LetterAttachment,
  LetterApproval,
  LetterDisposition,
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync database (hati-hati di production!)
// sequelize.sync({ alter: true }).then(() => {
//   console.log("Database synced");
// });

export { 
  sequelize, 
  User, 
  School, 
  Student, 
  Teacher, 
  Role, 
  UserRole, 
  App, 
  SchoolApp, 
  Session,
  AcademicYear,
  Grade,
  Department,
  ClassRoom,
  StudentMutation,
  StudentClassHistory,
  Achievement,
  AchievementParticipant,
  AchievementResult,
  AchievementDocument,
  Guestbook,
  IncomingLetter,
  OutgoingLetter,
  LetterAttachment,
  LetterApproval,
  LetterDisposition
};

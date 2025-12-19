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
import DocumentTypeModel from "./documentType.model.js";
import StudentDocumentModel from "./studentDocument.model.js";
import CardTemplateModel from "./cardTemplate.model.js";
import CertificateTemplateModel from "./certificateTemplate.model.js";
import StudentCertificateModel from "./studentCertificate.model.js";
import ParentProfileModel from "./parentProfile.model.js";
import ParentDocumentModel from "./parentDocument.model.js";
import ViolationLevelModel from "./violationLevel.model.js";
import ViolationTypeModel from "./violationType.model.js";
import ViolationActionModel from "./violationAction.model.js";
import StudentViolationModel from "./studentViolation.model.js";
import RewardLevelModel from "./rewardLevel.model.js";
import RewardTypeModel from "./rewardType.model.js";
import RewardActionModel from "./rewardAction.model.js";
import StudentRewardModel from "./studentReward.model.js";
import CounselingCaseModel from "./CounselingCase.js";
import CounselingSessionModel from "./CounselingSession.js";
import CounselingFollowupModel from "./CounselingFollowup.js";
import CounselingDocumentModel from "./CounselingDocument.js";
import CounselingScheduleModel from "./CounselingSchedule.js";

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
const DocumentType = DocumentTypeModel(sequelize, DataTypes);
const StudentDocument = StudentDocumentModel(sequelize, DataTypes);
const CardTemplate = CardTemplateModel(sequelize, DataTypes);
const CertificateTemplate = CertificateTemplateModel(sequelize, DataTypes);
const StudentCertificate = StudentCertificateModel(sequelize, DataTypes);
const ParentProfile = ParentProfileModel(sequelize, DataTypes);
const ParentDocument = ParentDocumentModel(sequelize, DataTypes);
const ViolationLevel = ViolationLevelModel(sequelize, DataTypes);
const ViolationType = ViolationTypeModel(sequelize, DataTypes);
const ViolationAction = ViolationActionModel(sequelize, DataTypes);
const StudentViolation = StudentViolationModel(sequelize, DataTypes);
const RewardLevel = RewardLevelModel(sequelize, DataTypes);
const RewardType = RewardTypeModel(sequelize, DataTypes);
const RewardAction = RewardActionModel(sequelize, DataTypes);
const StudentReward = StudentRewardModel(sequelize, DataTypes);
const CounselingCase = CounselingCaseModel(sequelize, DataTypes);
const CounselingSession = CounselingSessionModel(sequelize, DataTypes);
const CounselingFollowup = CounselingFollowupModel(sequelize, DataTypes);
const CounselingDocument = CounselingDocumentModel(sequelize, DataTypes);
const CounselingSchedule = CounselingScheduleModel(sequelize, DataTypes);

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
  DocumentType,
  StudentDocument,
  CardTemplate,
  CertificateTemplate,
  StudentCertificate,
  ParentProfile,
  ParentDocument,
  ViolationLevel,
  ViolationType,
  ViolationAction,
  StudentViolation,
  RewardLevel,
  RewardType,
  RewardAction,
  StudentReward,
  CounselingCase,
  CounselingSession,
  CounselingFollowup,
  CounselingDocument,
  CounselingSchedule,
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
  ViolationLevel,
  ViolationType,
  ViolationAction,
  StudentViolation,
  RewardLevel,
  RewardType,
  RewardAction,
  StudentReward,
  CounselingCase,
  CounselingSession,
  CounselingFollowup,
  CounselingDocument,
  CounselingSchedule,
  CardTemplate,
  CertificateTemplate,
  StudentCertificate,
  ParentProfile,
  ParentDocument,
  LetterApproval,
  LetterAttachment,
  LetterDisposition,
  DocumentType,
  StudentDocument,
};

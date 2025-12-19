export default (sequelize, DataTypes) => {
  const Student = sequelize.define(
    "Student",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      academic_year_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      grade_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      nis: { type: DataTypes.STRING(50), allowNull: true },
      nisn: { type: DataTypes.STRING(50), allowNull: true },
      date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      gender: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: "L atau P",
      },
      address: { type: DataTypes.TEXT, allowNull: true },
      parent_name: { type: DataTypes.STRING(100), allowNull: true },
      parent_phone: { type: DataTypes.STRING(30), allowNull: true },
      photo: { type: DataTypes.STRING(500), allowNull: true, comment: "URL foto siswa di MinIO" },
      photo_key: { type: DataTypes.STRING(255), allowNull: true, comment: "Key file di MinIO" },
      rfid_code: { type: DataTypes.STRING(100), allowNull: true, comment: "Kode RFID kartu siswa" },
      qr_code: { type: DataTypes.STRING(255), allowNull: true, comment: "URL atau encoding QR code" },
      barcode: { type: DataTypes.STRING(100), allowNull: true, comment: "Barcode kartu siswa" },
      card_template_id: { type: DataTypes.INTEGER, allowNull: true, comment: "Template kartu yang digunakan" },
      card_number: { type: DataTypes.STRING(100), allowNull: true, comment: "Nomor kartu siswa (auto generate)" },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "students",
      timestamps: false,
    }
  );

  Student.associate = (models) => {
    Student.belongsTo(models.School, {
      foreignKey: "school_id",
      as: "school",
    });
    Student.belongsTo(models.AcademicYear, {
      foreignKey: "academic_year_id",
      as: "academicYear",
    });
    Student.belongsTo(models.Grade, {
      foreignKey: "grade_id",
      as: "grade",
    });
    Student.belongsTo(models.ClassRoom, {
      foreignKey: "class_id",
      as: "class",
    });
    Student.belongsTo(models.Department, {
      foreignKey: "department_id",
      as: "department",
    });
    Student.belongsTo(models.CardTemplate, {
      foreignKey: "card_template_id",
      as: "cardTemplate",
    });
    Student.hasMany(models.ParentProfile, {
      foreignKey: "student_id",
      as: "parents",
    });
    Student.hasMany(models.AchievementParticipant, {
      foreignKey: "student_id",
      as: "achievementParticipants",
    });
  };

  return Student;
};

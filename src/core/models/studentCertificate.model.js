export default (sequelize, DataTypes) => {
    const StudentCertificate = sequelize.define(
        "StudentCertificate",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            school_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            student_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            achievement_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            template_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            certificate_number: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: "Nomor piagam/sertifikat",
            },
            certificate_title: {
                type: DataTypes.STRING(150),
                allowNull: true,
                comment: "Judul sertifikat, contoh: Piagam Penghargaan",
            },
            issued_date: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                comment: "Tanggal penerbitan sertifikat",
            },
            file_path: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: "Path file PDF hasil generate di MinIO",
            },
            file_key: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: "Key file di MinIO",
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: "student_certificates",
            timestamps: false,
        }
    );

    StudentCertificate.associate = (models) => {
        StudentCertificate.belongsTo(models.School, {
            foreignKey: "school_id",
            as: "school",
        });
        StudentCertificate.belongsTo(models.Student, {
            foreignKey: "student_id",
            as: "student",
        });
        StudentCertificate.belongsTo(models.Achievement, {
            foreignKey: "achievement_id",
            as: "achievement",
        });
        StudentCertificate.belongsTo(models.CertificateTemplate, {
            foreignKey: "template_id",
            as: "template",
        });
        StudentCertificate.belongsTo(models.User, {
            foreignKey: "created_by",
            as: "creator",
        });
    };

    return StudentCertificate;
};

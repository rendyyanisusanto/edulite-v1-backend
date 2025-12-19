export default (sequelize, DataTypes) => {
    const CertificateTemplate = sequelize.define(
        "CertificateTemplate",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            school_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                comment: 'Nama template (e.g., Sertifikat Prestasi Akademik)'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Deskripsi template'
            },
            background_image: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: 'URL gambar background template (JPG/PNG) di MinIO'
            },
            background_image_key: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: 'Key file background image di MinIO'
            },
            background_fit: {
                type: DataTypes.STRING(20),
                allowNull: true,
                defaultValue: 'cover',
                comment: 'cover, contain, fill, center'
            },
            orientation: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'portrait',
                comment: 'portrait atau landscape',
                validate: {
                    isIn: [['portrait', 'landscape']]
                }
            },
            certificate_width: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 800,
                comment: 'Lebar sertifikat dalam pixel'
            },
            certificate_height: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 600,
                comment: 'Tinggi sertifikat dalam pixel'
            },
            layout: {
                type: DataTypes.JSON,
                allowNull: true,
                comment: 'Posisi dan styling untuk setiap field dinamis',
                get() {
                    const rawValue = this.getDataValue('layout');
                    return rawValue ? (typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue) : null;
                },
                set(value) {
                    this.setDataValue('layout', value ? (typeof value === 'string' ? value : JSON.stringify(value)) : null);
                }
            },
            is_default: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                comment: 'Template default untuk sekolah'
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: 'Status aktif template'
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW
            },
        },
        {
            tableName: "certificate_templates",
            timestamps: false,
        }
    );

    CertificateTemplate.associate = (models) => {
        CertificateTemplate.belongsTo(models.School, {
            foreignKey: "school_id",
            as: "school",
        });
    };

    return CertificateTemplate;
};

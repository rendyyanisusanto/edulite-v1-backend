export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('students', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    school_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    nis: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Nomor Induk Siswa'
    },
    nisn: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Nomor Induk Siswa Nasional'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    gender: {
      type: Sequelize.ENUM('L', 'P'),
      allowNull: false,
      comment: 'L = Laki-laki, P = Perempuan'
    },
    place_of_birth: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    date_of_birth: {
      type: Sequelize.DATEONLY,
      allowNull: true
    },
    religion: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    parent_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    parent_phone: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    photo: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    grade_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'grades',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    class_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'classes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    department_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    academic_year_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'academic_years',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    enrollment_date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_DATE')
    },
    status: {
      type: Sequelize.ENUM('ACTIVE', 'GRADUATED', 'TRANSFERRED', 'DROPPED_OUT'),
      defaultValue: 'ACTIVE'
    },
    nik: {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: 'Nomor Induk Kependudukan'
    },
    kk_number: {
      type: Sequelize.STRING(30),
      allowNull: true,
      comment: 'Nomor Kartu Keluarga'
    },
    student_card_number: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Nomor Kartu Pelajar'
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
    }
  });

  // Indexes
  await queryInterface.addIndex('students', ['school_id']);
  await queryInterface.addIndex('students', ['nis']);
  await queryInterface.addIndex('students', ['nisn']);
  await queryInterface.addIndex('students', ['grade_id']);
  await queryInterface.addIndex('students', ['class_id']);
  await queryInterface.addIndex('students', ['academic_year_id']);
  await queryInterface.addIndex('students', ['status']);
  await queryInterface.addIndex('students', ['school_id', 'nis'], { unique: true });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('students');
};
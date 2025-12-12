export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('schools', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    code: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Kode unik tiap sekolah'
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    domain: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    phone: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    logo: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    status: {
      type: Sequelize.STRING(20),
      defaultValue: 'ACTIVE'
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
  await queryInterface.addIndex('schools', ['code']);
  await queryInterface.addIndex('schools', ['status']);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('schools');
};
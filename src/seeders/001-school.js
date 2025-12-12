export const up = async (queryInterface, Sequelize) => {
  const schools = [
    {
      code: 'SCH001',
      name: 'SMAN 1 Jakarta',
      address: 'Jl. Sudirman No. 1, Jakarta Pusat',
      phone: '021-12345678',
      email: 'info@sman1jakarta.sch.id',
      status: 'ACTIVE'
    },
    {
      code: 'SCH002',
      name: 'SMP Nusantara',
      address: 'Jl. Merdeka No. 45, Jakarta Selatan',
      phone: '021-87654321',
      email: 'admin@smpnusantara.sch.id',
      status: 'ACTIVE'
    },
    {
      code: 'SCH003',
      name: 'SD Pelangi Harapan',
      address: 'Jl. Kebangsaan No. 10, Jakarta Barat',
      phone: '021-11223344',
      email: 'info@sdpelangi.sch.id',
      status: 'ACTIVE'
    }
  ];

  await queryInterface.bulkInsert('schools', schools);
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.bulkDelete('schools', {
    code: ['SCH001', 'SCH002', 'SCH003']
  });
};
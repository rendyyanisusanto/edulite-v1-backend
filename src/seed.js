import { sequelize } from "./config/database.js";
import { School, User, Role, App } from "./core/models/index.js";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log("✅ Database tables created");

    // 1. Seed Roles
    console.log("Creating roles...");
    const roles = await Role.bulkCreate([
      { name: "SuperAdmin", description: "Administrator sistem" },
      { name: "AdminSekolah", description: "Administrator sekolah" },
      { name: "Guru", description: "Guru pengajar" },
      { name: "Siswa", description: "Siswa" },
      { name: "Ortu", description: "Orang tua siswa" },
    ]);
    console.log("✅ Roles created");

    // 2. Seed Apps
    console.log("Creating apps...");
    const apps = await App.bulkCreate([
      {
        code: "SIS",
        name: "Student Information System",
        description: "Sistem Informasi Siswa",
        base_url: "https://sis.edulite.id",
      },
      {
        code: "EPRESENSI",
        name: "E-Presensi",
        description: "Sistem Presensi Online",
        base_url: "https://presensi.edulite.id",
      },
      {
        code: "ELIB",
        name: "E-Library",
        description: "Perpustakaan Digital",
        base_url: "https://lib.edulite.id",
      },
      {
        code: "EFINANCE",
        name: "E-Finance",
        description: "Sistem Keuangan Sekolah",
        base_url: "https://finance.edulite.id",
      },
    ]);
    console.log("✅ Apps created");

    // 3. Create SuperAdmin User
    console.log("Creating superadmin...");
    const superadmin = await User.create({
      school_id: null,
      name: "Super Administrator",
      email: "superadmin@edulite.id",
      password_hash: "admin123", // akan di-hash otomatis
      role: "superadmin",
      is_active: true,
    });
    console.log("✅ SuperAdmin created");
    console.log("   Email: superadmin@edulite.id");
    console.log("   Password: admin123");

    // 4. Create Sample School
    console.log("Creating sample school...");
    const school1 = await School.create({
      code: "SDN001",
      name: "SD Negeri 1 Jakarta",
      domain: "sdn1-jakarta.edulite.id",
      address: "Jl. Pendidikan No. 1, Jakarta Pusat",
      phone: "021-12345678",
      logo: null,
      status: "ACTIVE",
    });
    console.log("✅ Sample school created");

    // 5. Create School Admin
    console.log("Creating school admin...");
    const schoolAdmin = await User.create({
      school_id: school1.id,
      name: "Admin SDN 1",
      email: "admin@sdn1-jakarta.edulite.id",
      password_hash: "admin123",
      role: "admin",
      is_active: true,
    });
    console.log("✅ School admin created");
    console.log("   Email: admin@sdn1-jakarta.edulite.id");
    console.log("   Password: admin123");

    // 6. Create Sample Teacher
    console.log("Creating sample teacher...");
    const teacher = await User.create({
      school_id: school1.id,
      name: "Budi Guru",
      email: "budi.guru@sdn1-jakarta.edulite.id",
      password_hash: "guru123",
      role: "guru",
      is_active: true,
    });
    console.log("✅ Sample teacher created");
    console.log("   Email: budi.guru@sdn1-jakarta.edulite.id");
    console.log("   Password: guru123");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   SuperAdmin: superadmin@edulite.id / admin123");
    console.log("   School Admin: admin@sdn1-jakarta.edulite.id / admin123");
    console.log("   Teacher: budi.guru@sdn1-jakarta.edulite.id / guru123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seed();

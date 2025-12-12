import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeds() {
  try {
    const seedersPath = path.join(__dirname, 'seeders');
    const files = await fs.readdir(seedersPath);

    const seedFiles = files
      .filter(file => file.endsWith('.js'))
      .sort();

    console.log('Running seeders...\n');

    for (const file of seedFiles) {
      const filePath = path.join(seedersPath, file);
      const seeder = await import(filePath);

      if (seeder.up && typeof seeder.up === 'function') {
        const queryInterface = sequelize.getQueryInterface();
        const { Sequelize } = await import('sequelize');

        await seeder.up(queryInterface, Sequelize);
        console.log(`✓ Seeder executed: ${file}`);
      }
    }

    console.log('\n✅ All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeder failed:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runSeeds();
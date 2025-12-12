import { Migration } from './utils/migration.js';

async function runMigrations() {
  const migration = new Migration();

  try {
    await migration.runMigrations();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
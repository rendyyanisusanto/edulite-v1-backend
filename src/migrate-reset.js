#!/usr/bin/env node

import { Migration } from './utils/migration.js';

const migration = new Migration();

console.log('Resetting all migrations (dropping all tables)...\n');

async function resetAll() {
  try {
    // Get all executed migrations in reverse order
    const [executed] = await migration.sequelize.query(`
      SELECT name FROM SequelizeMigrations ORDER BY name DESC
    `);

    if (executed.length === 0) {
      console.log('No migrations to reset.');
      return;
    }

    console.log(`Rolling back ${executed.length} migrations...`);

    for (const migrationRow of executed) {
      const fileName = `${migrationRow.name}.js`;
      await migration.rollbackMigration(fileName);
    }

    // Drop the migrations table
    await migration.sequelize.query('DROP TABLE IF EXISTS SequelizeMigrations');
    console.log('\n✅ All migrations have been reset!');
  } catch (error) {
    console.error('\n❌ Migration reset failed:', error.message);
    throw error;
  }
}

resetAll().then(() => {
  console.log('\n🔄 Database has been reset to initial state.');
  process.exit(0);
}).catch((error) => {
  process.exit(1);
});
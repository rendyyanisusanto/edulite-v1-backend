import { sequelize } from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Migration {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.sequelize = sequelize;
  }

  async getPendingMigrations() {
    try {
      // Ensure migrations table exists
      await this.createMigrationsTable();

      // Get all migration files
      const files = await fs.readdir(this.migrationsPath);
      const migrationFiles = files
        .filter(file => file.endsWith('.js'))
        .sort(); // Sort to ensure proper order

      // Get executed migrations from database
      const [executed] = await this.sequelize.query(`
        SELECT name FROM SequelizeMigrations ORDER BY name
      `);

      const executedNames = executed.map(m => m.name);

      // Filter only pending migrations
      return migrationFiles.filter(file => {
        const migrationName = path.basename(file, '.js');
        return !executedNames.includes(migrationName);
      });
    } catch (error) {
      console.error('Error getting pending migrations:', error);
      return [];
    }
  }

  async createMigrationsTable() {
    try {
      await this.sequelize.query(`
        CREATE TABLE IF NOT EXISTS SequelizeMigrations (
          name VARCHAR(255) NOT NULL UNIQUE,
          timestamp INTEGER,
          PRIMARY KEY (name)
        )
      `);
    } catch (error) {
      console.error('Error creating migrations table:', error);
    }
  }

  async executeMigration(fileName) {
    const filePath = path.join(this.migrationsPath, fileName);
    const migration = await import(filePath);

    if (migration.up && typeof migration.up === 'function') {
      const queryInterface = this.sequelize.getQueryInterface();
      const { Sequelize } = await import('sequelize');

      await migration.up(queryInterface, Sequelize);

      // Record migration
      const migrationName = path.basename(fileName, '.js');
      const timestamp = parseInt(migrationName.split('-')[0]) || Date.now();

      await this.sequelize.query(`
        INSERT INTO SequelizeMigrations (name, timestamp)
        VALUES (?, ?)
      `, {
        replacements: [migrationName, timestamp]
      });

      console.log(`✓ Migration executed: ${fileName}`);
    } else {
      throw new Error(`Invalid migration file: ${fileName}`);
    }
  }

  async runMigrations() {
    try {
      const pending = await this.getPendingMigrations();

      if (pending.length === 0) {
        console.log('No pending migrations.');
        return;
      }

      console.log(`Running ${pending.length} pending migrations...`);

      for (const file of pending) {
        await this.executeMigration(file);
      }

      console.log('All migrations completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  async rollbackMigration(fileName) {
    const filePath = path.join(this.migrationsPath, fileName);
    const migration = await import(filePath);

    if (migration.down && typeof migration.down === 'function') {
      await migration.down(this.sequelize.getQueryInterface());

      // Remove from migrations table
      const migrationName = path.basename(fileName, '.js');
      await this.sequelize.query(`
        DELETE FROM SequelizeMigrations WHERE name = ?
      `, {
        replacements: [migrationName]
      });

      console.log(`✓ Migration rolled back: ${fileName}`);
    }
  }
}
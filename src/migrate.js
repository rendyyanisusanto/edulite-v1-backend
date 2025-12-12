#!/usr/bin/env node

import { Migration } from './utils/migration.js';

const migration = new Migration();

console.log('Starting database migrations...\n');

migration.runMigrations().then(() => {
  console.log('\n✅ All migrations completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
});
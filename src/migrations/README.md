# Database Migrations

This directory contains all database migrations for the EduLite application.

## Migration Files

- `001-create-schools-table.js` - Creates schools table
- `002-create-academic-years-table.js` - Creates academic_years table
- `003-create-grades-table.js` - Creates grades table
- `004-create-departments-table.js` - Creates departments table
- `005-create-classes-table.js` - Creates classes table
- `006-create-students-table.js` - Creates students table
- `007-create-violation-tables.js` - Creates violation_levels, violation_types, and violation_actions tables
- `008-create-student-violations-table.js` - Creates student_violations table
- `009-create-reward-tables.js` - Creates reward_levels, reward_types, and reward_actions tables
- `010-create-student-rewards-table.js` - Creates student_rewards table
- `011-create-point-recap-tables.js` - Creates point recap tables (student_point_recap, class_point_recap, grade_point_recap, point_recap_logs)

## Running Migrations

### Run all pending migrations:
```bash
npm run migrate
```

### Reset all migrations (drop all tables):
```bash
npm run migrate:reset
```

## Migration Structure

Each migration file exports two functions:
- `up(queryInterface, Sequelize)` - Applies the migration
- `down(queryInterface, Sequelize)` - Reverts the migration

## Features

- Automatic tracking of executed migrations
- Sequential execution based on file names
- Rollback capability
- Clean database initialization
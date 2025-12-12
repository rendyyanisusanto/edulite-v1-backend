# Database Setup & Migration Guide

This guide explains how to set up and manage the database for EduLite application using Sequelize migrations.

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed
- Database created: `edulite_v1`

## Environment Configuration

Make sure your `.env` file is properly configured:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
DB_NAME=edulite_v1
```

## Database Commands

### 1. Run All Migrations
Creates all necessary tables in the database:
```bash
npm run migrate
```

### 2. Reset All Migrations
Drops all tables and resets to initial state:
```bash
npm run migrate:reset
```

### 3. Run Seeders
Populates database with initial data:
```bash
npm run seed
```

### 4. Fresh Setup
Complete database reset with migrations and seeders:
```bash
npm run migrate:reset
npm run migrate
npm run seed
```

## Migration Files Structure

```
src/migrations/
├── 001-create-schools-table.js
├── 002-create-academic-years-table.js
├── 003-create-grades-table.js
├── 004-create-departments-table.js
├── 005-create-classes-table.js
├── 006-create-students-table.js
├── 007-create-violation-tables.js
├── 008-create-student-violations-table.js
├── 009-create-reward-tables.js
├── 010-create-student-rewards-table.js
└── 011-create-point-recap-tables.js
```

## Table Relationships

```
schools
├── academic_years (1:N)
├── grades (1:N)
├── departments (1:N)
├── classes (N:M through grades)
├── users (1:N)
├── violation_levels (1:N)
├── violation_types (1:N)
├── violation_actions (1:N)
├── reward_levels (1:N)
├── reward_types (1:N)
└── reward_actions (1:N)

grades
└── classes (1:N)

classes
└── students (1:N)

students
├── student_violations (1:N)
└── student_rewards (1:N)

student_violations
├── violation_types (N:1)
└── violation_actions (N:1)

student_rewards
├── reward_types (N:1)
└── reward_actions (N:1)
```

## Important Notes

1. **Multi-tenant Architecture**: All tables reference `school_id` to ensure data isolation between schools.

2. **Soft Deletes**: Important data uses status fields instead of hard deletes for audit trails.

3. **Timestamps**: All tables include `created_at` and `updated_at` for tracking changes.

4. **Foreign Keys**: All foreign key constraints are properly defined with appropriate ON DELETE actions.

5. **Indexes**: Strategic indexes are created for performance optimization.

## Creating New Migrations

When adding new features, create migration files following this naming convention:
```
XXX-description.js
```

Example:
```javascript
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('new_table', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    // ... other columns
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
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('new_table');
};
```

## Troubleshooting

### Migration fails with "Table already exists"
- Check if tables exist: `SHOW TABLES;`
- Run `npm run migrate:reset` to clean start

### Foreign key constraint errors
- Ensure parent tables exist before child tables
- Check the order of migrations (prefix with numbers)

### Permission denied errors
- Check MySQL user permissions
- Ensure user has CREATE, ALTER, DROP privileges
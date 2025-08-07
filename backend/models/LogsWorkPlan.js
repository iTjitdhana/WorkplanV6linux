const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LogsWorkPlan = sequelize.define('logs_workplans', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  work_plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'work_plans',
      key: 'id'
    }
  },
  production_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  job_code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  job_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  input_material_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'จำนวนวัตถุดิบเข้า'
  },
  input_material_unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'หน่วยวัตถุดิบเข้า'
  },
  output_quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'จำนวนที่ผลิตได้'
  },
  output_unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'หน่วยที่ผลิตได้'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'หมายเหตุ'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'logs_workplans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = LogsWorkPlan;

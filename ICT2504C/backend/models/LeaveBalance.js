const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LeaveBalance = sequelize.define("LeaveBalance", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },

  annualQuota: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 14
  },

  annualUsed: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },

  sickUsed: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
});

module.exports = LeaveBalance;
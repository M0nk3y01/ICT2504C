const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LeaveRequest = sequelize.define("LeaveRequest", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  leaveType: {
    type: DataTypes.ENUM("annual", "sick"),
    allowNull: false
  },

  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },

  dayPortion: {
    type: DataTypes.ENUM("full_day", "am", "pm"),
    allowNull: false,
    defaultValue: "full_day"
  },

  daysRequested: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },

  reason: {
    type: DataTypes.STRING,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending"
  },

  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = LeaveRequest;
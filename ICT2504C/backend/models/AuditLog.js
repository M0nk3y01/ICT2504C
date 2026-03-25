const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AuditLog = sequelize.define("AuditLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  action: {
    type: DataTypes.STRING,
    allowNull: false
  },

  details: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  actorRole: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = AuditLog;
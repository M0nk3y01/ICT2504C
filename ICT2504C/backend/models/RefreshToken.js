const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RefreshToken = sequelize.define("RefreshToken", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  tokenHash: {
    type: DataTypes.STRING,
    allowNull: false
  },

  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },

  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = RefreshToken;
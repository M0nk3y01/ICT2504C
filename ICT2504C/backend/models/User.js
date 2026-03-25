const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM("employee", "manager", "admin"),
    allowNull: false,
    defaultValue: "employee"
  },

  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  department: {
    type: DataTypes.STRING,
    allowNull: true
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },

  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = User;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PublicHoliday = sequelize.define("PublicHoliday", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  holidayDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  }
});

module.exports = PublicHoliday;
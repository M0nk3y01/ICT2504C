const { Sequelize } = require("sequelize");
require("dotenv").config();

if (!process.env.DB_PASSWORD) {
  throw new Error("DB_PASSWORD is not set in .env");
}

const sequelize = new Sequelize(
  process.env.DB_NAME || "hrms_db",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false
  }
);

module.exports = sequelize;
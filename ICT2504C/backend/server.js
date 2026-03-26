const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { sequelize } = require("./models");

const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const auditRoutes = require("./routes/auditRoutes");

const syncSingaporePublicHolidays = require("./utils/syncPublicHolidays");

const app = express();

// Restrict CORS to the frontend origin only
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "HRMS backend is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/audit", auditRoutes);

sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log("Database connected");

    await syncSingaporePublicHolidays();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database sync error:", error);
  });
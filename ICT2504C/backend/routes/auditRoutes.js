const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getAuditLogs } = require("../controllers/auditController");

router.get("/", protect, allowRoles("admin"), getAuditLogs);

module.exports = router;
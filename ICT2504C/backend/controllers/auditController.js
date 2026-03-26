const { AuditLog } = require("../models");

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      order: [["createdAt", "DESC"]]
    });

    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
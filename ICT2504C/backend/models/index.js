const sequelize = require("../config/db");

const User = require("./User");
const LeaveRequest = require("./LeaveRequest");
const LeaveBalance = require("./LeaveBalance");
const PublicHoliday = require("./PublicHoliday");
const AuditLog = require("./AuditLog");
const PasswordResetToken = require("./PasswordResetToken");
const RefreshToken = require("./RefreshToken");

User.hasMany(LeaveRequest, { foreignKey: "userId" });
LeaveRequest.belongsTo(User, { foreignKey: "userId" });

User.hasOne(LeaveBalance, { foreignKey: "userId" });
LeaveBalance.belongsTo(User, { foreignKey: "userId" });

User.hasMany(AuditLog, { foreignKey: "userId" });
AuditLog.belongsTo(User, { foreignKey: "userId" });

User.hasMany(PasswordResetToken, { foreignKey: "userId" });
PasswordResetToken.belongsTo(User, { foreignKey: "userId" });

User.hasMany(RefreshToken, { foreignKey: "userId" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  User,
  LeaveRequest,
  LeaveBalance,
  PublicHoliday,
  AuditLog,
  PasswordResetToken,
  RefreshToken
};
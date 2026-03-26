const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const {
  User,
  LeaveBalance,
  AuditLog,
  PasswordResetToken,
  RefreshToken
} = require("../models");

const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/generateToken");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const logAudit = async (userId, action, details, actorRole = null) => {
  await AuditLog.create({
    userId,
    action,
    details: details ? JSON.stringify(details) : null,
    actorRole
  });
};

exports.bootstrapAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ where: { role: "admin" } });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists. Use admin account creation route."
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      mustChangePassword: false
    });

    await LeaveBalance.create({
      userId: admin.id,
      annualQuota: Number(process.env.DEFAULT_ANNUAL_LEAVE || 14)
    });

    await logAudit(admin.id, "BOOTSTRAP_ADMIN", { email }, "admin");

    return res.status(201).json({
      message: "Initial admin created",
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password, role, managerId, department, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "name, email, password and role are required"
      });
    }

    if (!["employee", "manager", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      managerId: managerId || null,
      department: department || null,
      phone: phone || null,
      mustChangePassword: true
    });

    await LeaveBalance.create({
      userId: user.id,
      annualQuota: Number(process.env.DEFAULT_ANNUAL_LEAVE || 14)
    });

    await logAudit(
      req.user.id,
      "CREATE_EMPLOYEE",
      { createdUserId: user.id, email, role },
      req.user.role
    );

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
      department: user.department,
      phone: user.phone,
      mustChangePassword: user.mustChangePassword
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const maxAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isLocked) {
      await logAudit(user.id, "LOGIN_BLOCKED_LOCKED_ACCOUNT", { email }, user.role);
      return res.status(403).json({ message: "Account is locked. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= maxAttempts) {
        user.isLocked = true;
      }

      await user.save();

      await logAudit(
        user.id,
        "FAILED_LOGIN",
        { email, failedLoginAttempts: user.failedLoginAttempts },
        user.role
      );

      return res.status(400).json({
        message: user.isLocked
          ? "Account locked after repeated failed attempts"
          : "Invalid credentials"
      });
    }

    user.failedLoginAttempts = 0;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);

    await RefreshToken.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000)
    });

    await logAudit(user.id, "LOGIN_SUCCESS", { email }, user.role);

    return res.json({
      token: accessToken,
      refreshToken,
      role: user.role,
      mustChangePassword: user.mustChangePassword
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET || "supersecretrefreshkey"
      );
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const tokenHash = hashToken(refreshToken);

    const existingToken = await RefreshToken.findOne({
      where: {
        userId: decoded.id,
        tokenHash,
        isRevoked: false
      }
    });

    if (!existingToken) {
      return res.status(401).json({ message: "Refresh token not recognised" });
    }

    if (new Date(existingToken.expiresAt) < new Date()) {
      existingToken.isRevoked = true;
      await existingToken.save();
      return res.status(401).json({ message: "Refresh token expired" });
    }

    existingToken.isRevoked = true;
    await existingToken.save();

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isLocked) {
      return res.status(403).json({ message: "Account is locked" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const refreshDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);

    await RefreshToken.create({
      userId: user.id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000)
    });

    await logAudit(user.id, "REFRESH_TOKEN_ROTATED", null, user.role);

    return res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);

      const existingToken = await RefreshToken.findOne({
        where: { tokenHash, isRevoked: false }
      });

      if (existingToken) {
        existingToken.isRevoked = true;
        await existingToken.save();

        await logAudit(existingToken.userId, "LOGOUT", null, req.user?.role || null);
      }
    }

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "oldPassword and newPassword are required" });
    }

    const user = await User.findByPk(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    await logAudit(user.id, "CHANGE_PASSWORD", null, user.role);

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({
        message: "If the email exists, a reset link has been generated"
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresMinutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 15);

    await PasswordResetToken.create({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + expiresMinutes * 60 * 1000)
    });

    // Audit: track who requested the password reset
    await logAudit(
      user.id,
      "FORGOT_PASSWORD_REQUEST",
      {
        requestedBy: user.email,
        name: user.name,
        role: user.role,
        tokenExpiresInMinutes: expiresMinutes
      },
      user.role
    );

    return res.json({
      message: "Password reset token generated",
      resetToken: token,
      note: "For demo, token is returned in API response. In production, email the link."
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "token and newPassword are required" });
    }

    const resetRecord = await PasswordResetToken.findOne({
      where: { token, used: false }
    });

    if (!resetRecord) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (new Date(resetRecord.expiresAt) < new Date()) {
      return res.status(400).json({ message: "Reset token has expired" });
    }

    const user = await User.findByPk(resetRecord.userId);

    const wasLocked = user.isLocked;

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();

    // Audit: track who reset the password and whether account was unlocked as a result
    await logAudit(
      user.id,
      "RESET_PASSWORD",
      {
        resetBy: user.email,
        name: user.name,
        role: user.role,
        accountWasLocked: wasLocked,
        accountUnlockedByReset: wasLocked
      },
      user.role
    );

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password"]
      }
    });

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const { name, department, phone } = req.body;

    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    await logAudit(user.id, "UPDATE_PROFILE", { name, department, phone }, user.role);

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        department: user.department,
        phone: user.phone
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password"]
      },
      order: [["id", "ASC"]]
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.unlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.failedLoginAttempts = 0;
    user.isLocked = false;
    await user.save();

    await logAudit(
      req.user.id,
      "UNLOCK_USER",
      { unlockedUserId: user.id, unlockedUserEmail: user.email },
      req.user.role
    );

    return res.json({ message: "User unlocked successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
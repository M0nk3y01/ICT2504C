const { Op } = require("sequelize");
const {
  LeaveRequest,
  User,
  LeaveBalance,
  PublicHoliday,
  AuditLog
} = require("../models");

const logAudit = async (userId, action, details, actorRole = null) => {
  await AuditLog.create({
    userId,
    action,
    details: details ? JSON.stringify(details) : null,
    actorRole
  });
};

const toDateOnlyString = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

const getDatesBetween = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(toDateOnlyString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const calculateLeaveDays = async (startDate, endDate, dayPortion) => {
  const dates = getDatesBetween(startDate, endDate);

  const holidays = await PublicHoliday.findAll({
    where: {
      holidayDate: {
        [Op.in]: dates
      }
    }
  });

  const holidaySet = new Set(holidays.map((holiday) => holiday.holidayDate));

  let total = 0;

  for (const date of dates) {
    if (isWeekend(date)) continue;
    if (holidaySet.has(date)) continue;
    total += 1;
  }

  if (dayPortion !== "full_day") {
    if (startDate !== endDate) {
      return -1;
    }
    if (total <= 0) {
      return 0;
    }
    return 0.5;
  }

  return total;
};

exports.applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      dayPortion = "full_day"
    } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        message: "leaveType, startDate and endDate are required"
      });
    }

    if (!["annual", "sick"].includes(leaveType)) {
      return res.status(400).json({ message: "Invalid leave type" });
    }

    if (!["full_day", "am", "pm"].includes(dayPortion)) {
      return res.status(400).json({ message: "Invalid dayPortion" });
    }

    const today = toDateOnlyString(new Date());

    if (endDate < startDate) {
      return res.status(400).json({
        message: "End date cannot be before start date"
      });
    }

    if (startDate < today) {
      return res.status(400).json({
        message: "Employees cannot apply for leave in the past"
      });
    }

    const overlappingLeave = await LeaveRequest.findOne({
      where: {
        userId: req.user.id,
        status: {
          [Op.in]: ["pending", "approved"]
        },
        [Op.and]: [
          { startDate: { [Op.lte]: endDate } },
          { endDate: { [Op.gte]: startDate } }
        ]
      }
    });

    if (overlappingLeave) {
      return res.status(400).json({
        message: "Overlapping leave request detected"
      });
    }

    const daysRequested = await calculateLeaveDays(
      startDate,
      endDate,
      dayPortion
    );

    if (daysRequested === -1) {
      return res.status(400).json({
        message: "Half-day leave must have the same start and end date"
      });
    }

    if (daysRequested <= 0) {
      return res.status(400).json({
        message: "Leave period contains no chargeable working day"
      });
    }

    const balance = await LeaveBalance.findOne({
      where: { userId: req.user.id }
    });

    if (leaveType === "annual") {
      const remaining = balance.annualQuota - balance.annualUsed;

      if (daysRequested > remaining) {
        return res.status(400).json({
          message: `Insufficient annual leave balance. Remaining: ${remaining}`
        });
      }
    }

    const leave = await LeaveRequest.create({
      userId: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason: reason || null,
      dayPortion,
      daysRequested,
      status: "pending"
    });

    await logAudit(
      req.user.id,
      "APPLY_LEAVE",
      {
        leaveId: leave.id,
        leaveType,
        startDate,
        endDate,
        dayPortion,
        daysRequested
      },
      req.user.role
    );

    return res.status(201).json(leave);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]]
    });

    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getPendingLeaves = async (req, res) => {
  try {
    let whereClause = { status: "pending" };

    if (req.user.role === "manager") {
      const directReports = await User.findAll({
        where: { managerId: req.user.id },
        attributes: ["id"]
      });

      const employeeIds = directReports.map((user) => user.id);

      whereClause.userId = {
        [Op.in]: employeeIds
      };
    }

    const leaves = await LeaveRequest.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role", "managerId"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "role", "managerId"]
        }
      ]
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message: "Only pending leave can be approved"
      });
    }

    if (
      req.user.role === "manager" &&
      leave.User.managerId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Managers can only approve leave for their direct reports"
      });
    }

    const balance = await LeaveBalance.findOne({
      where: { userId: leave.userId }
    });

    if (leave.leaveType === "annual") {
      const remaining = balance.annualQuota - balance.annualUsed;

      if (leave.daysRequested > remaining) {
        return res.status(400).json({
          message: `Insufficient annual leave balance. Remaining: ${remaining}`
        });
      }

      balance.annualUsed += leave.daysRequested;
    } else if (leave.leaveType === "sick") {
      balance.sickUsed += leave.daysRequested;
    }

    await balance.save();

    leave.status = "approved";
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();

    await logAudit(
      req.user.id,
      "APPROVE_LEAVE",
      { leaveId: leave.id, employeeId: leave.userId },
      req.user.role
    );

    return res.json({
      message: "Leave approved successfully",
      leave
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await LeaveRequest.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "role", "managerId"]
        }
      ]
    });

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message: "Only pending leave can be rejected"
      });
    }

    if (
      req.user.role === "manager" &&
      leave.User.managerId !== req.user.id
    ) {
      return res.status(403).json({
        message: "Managers can only reject leave for their direct reports"
      });
    }

    leave.status = "rejected";
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();
    await leave.save();

    await logAudit(
      req.user.id,
      "REJECT_LEAVE",
      { leaveId: leave.id, employeeId: leave.userId },
      req.user.role
    );

    return res.json({
      message: "Leave rejected successfully",
      leave
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMyLeaveBalance = async (req, res) => {
  try {
    const balance = await LeaveBalance.findOne({
      where: { userId: req.user.id }
    });

    if (!balance) {
      return res.status(404).json({ message: "Leave balance not found" });
    }

    const remainingAnnual = balance.annualQuota - balance.annualUsed;

    return res.json({
      annualQuota: balance.annualQuota,
      annualUsed: balance.annualUsed,
      annualRemaining: remainingAnnual,
      sickUsed: balance.sickUsed
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createPublicHoliday = async (req, res) => {
  try {
    const { name, holidayDate } = req.body;

    if (!name || !holidayDate) {
      return res.status(400).json({
        message: "name and holidayDate are required"
      });
    }

    const holiday = await PublicHoliday.create({
      name,
      holidayDate
    });

    await logAudit(
      req.user.id,
      "CREATE_PUBLIC_HOLIDAY",
      { holidayId: holiday.id, name, holidayDate },
      req.user.role
    );

    return res.status(201).json(holiday);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getPublicHolidays = async (req, res) => {
  try {
    const holidays = await PublicHoliday.findAll({
      order: [["holidayDate", "ASC"]]
    });

    return res.json(holidays);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getMyLeaveBalance,
  createPublicHoliday,
  getPublicHolidays
} = require("../controllers/leaveController");

router.post(
  "/apply",
  protect,
  allowRoles("employee", "manager", "admin"),
  applyLeave
);

router.get("/my-leaves", protect, getMyLeaves);
router.get("/my-balance", protect, getMyLeaveBalance);

router.get(
  "/pending",
  protect,
  allowRoles("manager", "admin"),
  getPendingLeaves
);

router.put(
  "/:id/approve",
  protect,
  allowRoles("manager", "admin"),
  approveLeave
);

router.put(
  "/:id/reject",
  protect,
  allowRoles("manager", "admin"),
  rejectLeave
);

router.post(
  "/holidays",
  protect,
  allowRoles("admin"),
  createPublicHoliday
);

router.get(
  "/holidays",
  protect,
  getPublicHolidays
);

module.exports = router;
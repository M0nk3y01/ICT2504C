const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  bootstrapAdmin,
  createEmployee,
  login,
  refreshAccessToken,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  getAllProfiles,
  unlockUser
} = require("../controllers/authController");

router.post("/bootstrap-admin", bootstrapAdmin);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post(
  "/create",
  protect,
  allowRoles("admin"),
  createEmployee
);

router.post(
  "/change-password",
  protect,
  changePassword
);

router.get(
  "/me",
  protect,
  getMyProfile
);

router.put(
  "/me",
  protect,
  updateMyProfile
);

router.get(
  "/profiles",
  protect,
  allowRoles("admin"),
  getAllProfiles
);

router.put(
  "/unlock/:id",
  protect,
  allowRoles("admin"),
  unlockUser
);

module.exports = router;
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
    getUsers,
    getAdminStats,
    updateUserStatus,
    updateUserRole,
    deleteUser
} = require("../controllers/admincontroller");

router.use(protect);
router.use(adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getUsers);

router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);

router.delete("/users/:id", deleteUser);

module.exports = router;
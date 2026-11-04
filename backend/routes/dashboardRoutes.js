const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getDashboard,
    getActivity
} = require("../controllers/dashboardcontroller");

router.use(protect);

router.get("/", getDashboard);
router.get("/activity", getActivity);

module.exports = router;
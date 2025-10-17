// server/routes/dashboard.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/dashboardController");
const { auth, requireAdmin } = require("../middleware/auth");

router.get("/", auth, requireAdmin, ctrl.getDashboardData);

module.exports = router;

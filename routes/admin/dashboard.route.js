const router = require("express").Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");
const { checkPermission, checkPagePermission } = require("../../middlewares/admin/permission.middleware");

router.get('/', checkPagePermission("dashboard-view"), dashboardController.dashboard)

router.post('/revenue-chart', checkPermission("dashboard-view"), dashboardController.revenueChartPost)

module.exports = router;
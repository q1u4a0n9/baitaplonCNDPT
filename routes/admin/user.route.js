const router = require("express").Router();
const userController = require("../../controllers/admin/user.controller");
const { checkPagePermission } = require("../../middlewares/admin/permission.middleware");

router.get('/list', checkPagePermission("user-view"), userController.list)

module.exports = router;
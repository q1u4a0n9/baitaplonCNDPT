const router = require("express").Router();
const contactController = require("../../controllers/admin/contact.controller");
const { checkPagePermission } = require("../../middlewares/admin/permission.middleware");

router.get('/list', checkPagePermission("contact-view"), contactController.list)

module.exports = router;
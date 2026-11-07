const router = require("express").Router();
const orderController = require("../../controllers/admin/order.controller");
const { checkPermission, checkPagePermission } = require("../../middlewares/admin/permission.middleware");

router.get('/list', checkPagePermission("order-view"), orderController.list)

router.get('/edit/:id', checkPagePermission("order-view"), orderController.edit)

router.patch('/edit/:id', checkPermission("order-edit"), orderController.editPatch)

module.exports = router;
const router = require("express").Router();
const orderController = require("../../controllers/admin/order.controller");
const { checkPermission } = require("../../middlewares/admin/permission.middleware");

router.get('/list', orderController.list)

router.get('/edit/:id', orderController.edit)

router.patch('/edit/:id', checkPermission("order-edit"), orderController.editPatch)

module.exports = router;
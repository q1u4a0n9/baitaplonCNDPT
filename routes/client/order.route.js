const router = require("express").Router();
const orderController = require("../../controllers/client/order.controller");

router.post('/create', orderController.createPost)

router.get('/success', orderController.success)

router.get('/payment-zalopay', orderController.paymentZalopay)

module.exports = router;
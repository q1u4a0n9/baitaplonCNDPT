const router = require("express").Router();
const orderController = require("../../controllers/client/order.controller");

router.post('/create', orderController.createPost)

router.get('/success', orderController.success)

router.get('/payment-zalopay', orderController.paymentZalopay)

router.post('/payment-zalopay-result', orderController.paymentZalopayResultPost)

router.get('/payment-vnpay', orderController.paymentVNpay)

module.exports = router;
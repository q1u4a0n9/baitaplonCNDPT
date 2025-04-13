const generateHelper = require("../../helpers/generate.helper");
const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model");

module.exports.createPost = async (req, res) => {
  // Mã đơn hàng
  req.body.code = "OD" + generateHelper.generateRandomNumber(10);

  // Danh sách tour
  for (const item of req.body.items) {
    const infoTour = await Tour.findOne({
      _id: item.tourId
    })

    // Thêm giá
    item.priceNewAdult = infoTour.priceNewAdult;
    item.priceNewChildren = infoTour.priceNewChildren;
    item.priceNewBaby = infoTour.priceNewBaby;

    // Thêm ngày khởi hành
    item.departureDate = infoTour.departureDate;

    // Cập nhật lại số lượng còn lại của tour
    await Tour.updateOne({
      _id: item.tourId
    }, {
      stockAdult: infoTour.stockAdult - item.quantityAdult,
      stockChildren: infoTour.stockChildren - item.quantityChildren,
      stockBaby: infoTour.stockBaby - item.quantityBaby
    })
  }

  // Thanh toán
  // Tạm tính
  req.body.subTotal = req.body.items.reduce((sum, item) => {
    return sum + (item.priceNewAdult*item.quantityAdult + item.priceNewChildren*item.quantityChildren + item.priceNewBaby*item.quantityBaby)
  }, 0);

  // Tổng tiền
  req.body.total = req.body.subTotal;

  // Trạng thái thanh toán
  req.body.paymentStatus = "unpaid";
  // unpaid: chưa thanh toán, paid: đã thanh toán

  // Trạng thái đơn hàng
  req.body.status = "initial";
  // initial: khởi tạo, done: hoàn thành, cancel: hủy

  const newRecord = new Order(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Đặt hàng thành công!",
    orderCode: req.body.code
  })
}
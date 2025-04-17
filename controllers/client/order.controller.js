const moment = require("moment");
const crypto = require("crypto");
const axios = require("axios");
const generateHelper = require("../../helpers/generate.helper");
const Order = require("../../models/order.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");

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

module.exports.success = async (req, res) => {
  const { orderCode, phone } = req.query;

  const orderDetail = await Order.findOne({
    code: orderCode,
    phone: phone
  })

  if(orderDetail) {
    switch (orderDetail.paymentMethod) {
      case "money":
        orderDetail.paymentMethodName = "Thanh toán tiền mặt";
        break;
      case "momo":
        orderDetail.paymentMethodName = "Ví MoMo";
        break;
      case "bank":
        orderDetail.paymentMethodName = "Chuyển khoản ngân hàng";
        break;
    }

    switch (orderDetail.paymentStatus) {
      case "unpaid":
        orderDetail.paymentStatusName = "Chưa thanh toán";
        break;
      case "paid":
        orderDetail.paymentStatusName = "Đã thanh toán";
        break;
    }

    switch (orderDetail.status) {
      case "initial":
        orderDetail.statusName = "Khởi tạo";
        break;
      case "done":
        orderDetail.statusName = "Hoàn thành";
        break;
      case "cancel":
        orderDetail.statusName = "Hủy";
        break;
    }

    orderDetail.createdAtFormat = moment(orderDetail.createdAt).format("HH:mm - DD/MM/YYYY");

    for (const item of orderDetail.items) {
      const tourInfo = await Tour.findOne({
        _id: item.tourId
      });

      if(tourInfo) {
        item.avatar = tourInfo.avatar;
        item.name = tourInfo.name;
        item.slug = tourInfo.slug;
        item.departureDateFormat = moment(tourInfo.departureDate).format("HH:mm - DD/MM/YYYY");
        const city = await City.findOne({
          _id: item.locationFrom
        })
        item.locationFromName = city.name;
      }
    }

    res.render("client/pages/order-success", {
      pageTitle: "Đặt hàng thành công",
      orderDetail: orderDetail
    });
  } else {
    res.redirect("/");
  }
}

module.exports.paymentZalopay = async (req, res) => {
  const orderCode = req.query.orderCode;

  const orderDetail = await Order.findOne({
    code: orderCode,
    deleted: false,
    paymentStatus: "unpaid"
  });

  if(orderDetail) {
    const apiZaloPay = "https://sb-openapi.zalopay.vn/v2/create";
    const appid = "2553";
    const key1 = "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL";
    // const key2 = "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz";

    const transID = Math.floor(Math.random() * 1000000);

    const dataFinal = {
      app_id: appid,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
      app_user: `${orderDetail.phone}-${orderDetail.code}`,
      app_time: Date.now(),
      item: JSON.stringify([{}]),
      embed_data: JSON.stringify({
        redirecturl: `http://localhost:3000/order/success?orderCode=${orderCode}&phone=${orderDetail.phone}`
      }),
      amount: orderDetail.total,
      description: `Thanh toán đơn hàng ${orderDetail.code}`,
      bank_code: "",
      mac: ""
    };

    const data = appid + "|" + dataFinal.app_trans_id + "|" + dataFinal.app_user + "|" + dataFinal.amount + "|" + dataFinal.app_time + "|" + dataFinal.embed_data + "|" + dataFinal.item;

    dataFinal.mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

    const response = await axios.post(apiZaloPay, null, { params: dataFinal });
    res.redirect(response.data.order_url);
  }
}
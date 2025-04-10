const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");
const moment = require("moment");

module.exports.cart = async (req, res) => {
  res.render("client/pages/cart", {
    pageTitle: "Giỏ hàng"
  });
}

module.exports.detailPost = async (req, res) => {
  const cart = req.body;
  
  for (const item of cart) {
    const tourInfo = await Tour.findOne({
      _id: item.tourId,
      status: "active",
      deleted: false
    })

    if(tourInfo) {
      item.avatar = tourInfo.avatar;
      item.name = tourInfo.name;
      item.slug = tourInfo.slug;
      item.departureDateFormat = moment(tourInfo.departureDate).format("DD/MM/YYYY");

      const city = await City.findOne({
        _id: item.locationFrom
      })
      item.locationFromName = city.name;

      item.stockAdult = tourInfo.stockAdult;
      item.stockChildren = tourInfo.stockChildren;
      item.stockBaby = tourInfo.stockBaby;

      if(item.quantityAdult > item.stockAdult) {
        item.quantityAdult = item.stockAdult;
      }

      if(item.quantityChildren > item.stockChildren) {
        item.quantityChildren = item.stockChildren;
      }

      if(item.quantityBaby > item.stockBaby) {
        item.quantityBaby = item.stockBaby;
      }

      item.priceNewAdult = tourInfo.priceNewAdult;
      item.priceNewChildren = tourInfo.priceNewChildren;
      item.priceNewBaby = tourInfo.priceNewBaby;
    } else {
      // Nếu không tìm thấy tour thì xóa tour khỏi giỏ hàng
      const indexItem = cart.findIndex(tour => tour.tourId == item.tourId);
      cart.splice(indexItem, 1);
    }
  }

  res.json({
    code: "success",
    message: "Thành công!",
    cart: cart
  })
}
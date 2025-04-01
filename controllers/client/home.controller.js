const moment = require("moment");
const Tour = require("../../models/tour.model");

module.exports.home = async (req, res) => {
  // Section 2
  const tourListSection2 = await Tour
    .find({
      priceNewAdult: { $gt: 0 }, // Lọc các tour có giá mới lớn hơn 0
      deleted: false,
      status: "active"
    })
    .sort({
      positon: "desc"
    })
    .limit(6);
  
    for(const item of tourListSection2) {
      item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
    }
  // End Section 2

  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2
  });
}
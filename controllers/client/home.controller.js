const moment = require("moment");
const Tour = require("../../models/tour.model");
const Category = require("../../models/category.model");

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

  // Section 4: Tour Trong Nước
  const categoryIdSection4 = "67d5719a02d674fe71de9d7d"; // Id của danh mục Tour Trong Nước
  const listCategory = [categoryIdSection4];

  const listSubCategory = await Category.find({
    parent: categoryIdSection4,
    deleted: false,
    status: "active"
  });

  for (const item of listSubCategory) {
    listCategory.push(item.id);
  }
  
  const tourListSection4 = await Tour
    .find({
      category: { $in: listCategory },
      deleted: false,
      status: "active"
    })
    .sort({
      positon: "desc"
    })
    .limit(8)

  for(const item of tourListSection4) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // End Section 4: Tour Trong Nước

  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4
  });
}
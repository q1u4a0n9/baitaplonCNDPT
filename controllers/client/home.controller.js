const moment = require("moment");
const Tour = require("../../models/tour.model");
const Category = require("../../models/category.model");

// Banner trỏ tới tour theo id vì slug của tour đổi mỗi khi đổi tên tour
const bannerTourIds = {
  namDu: "6aae3aba0977a7e62876fd38",
  phapThuySiY: "6aae5e764a68400e2ad2b024"
};

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
  const tourListSection4 = await getTourListByParentCategoryName("Tour Trong nước");
  // End Section 4: Tour Trong Nước

  // Section 6: Tour Nước Ngoài
  const tourListSection6 = await getTourListByParentCategoryName("Tour nước ngoài");
  // End Section 6: Tour Nước Ngoài

  const bannerLinks = await getBannerLinks();

  res.render("client/pages/home", {
    pageTitle: "Trang chủ",
    tourListSection2: tourListSection2,
    tourListSection4: tourListSection4,
    tourListSection6: tourListSection6,
    bannerLinks: bannerLinks
  });
}

// Link của các banner: trỏ tới trang chi tiết tour, nếu tour không còn (xóa/tạm dừng) thì để "#"
const getBannerLinks = async () => {
  const tourList = await Tour
    .find({
      _id: { $in: Object.values(bannerTourIds) },
      deleted: false,
      status: "active"
    })
    .select("slug");

  const links = {};
  for(const key in bannerTourIds) {
    const tour = tourList.find(item => item.id === bannerTourIds[key]);
    links[key] = tour ? `/tour/detail/${tour.slug}` : "#";
  }

  return links;
}

// Lấy danh sách tour thuộc 1 danh mục cha (theo tên) và toàn bộ danh mục con của nó
const getTourListByParentCategoryName = async (parentCategoryName) => {
  const parentCategory = await Category.findOne({
    name: parentCategoryName,
    deleted: false,
    status: "active"
  });

  if(!parentCategory) {
    return [];
  }

  const listCategory = [parentCategory.id];

  const listSubCategory = await Category.find({
    parent: parentCategory.id,
    deleted: false,
    status: "active"
  });

  for (const item of listSubCategory) {
    listCategory.push(item.id);
  }

  const tourList = await Tour
    .find({
      category: { $in: listCategory },
      deleted: false,
      status: "active"
    })
    .sort({
      position: "desc"
    })
    .limit(8);

  for(const item of tourList) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }

  return tourList;
}
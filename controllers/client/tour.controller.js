const moment = require("moment");
const Category = require("../../models/category.model");
const Tour = require("../../models/tour.model");
const City = require("../../models/city.model");

module.exports.detail = async (req, res) => {
  const slug = req.params.slug;

  const tourDetail = await Tour.findOne({
    slug: slug,
    status: "active",
    deleted: false
  })

  if(tourDetail) {
    // Breadcrumb
    const breadcrumb = {
      image: "",
      title: "",
      list: [
        {
          link: "/",
          title: "Trang Chủ"
        }
      ]
    };

    // Tìm category cha cấp 1
    const category = await Category.findOne({
      _id: tourDetail.category,
      deleted: false,
      status: "active"
    })

    // Tìm category cha cấp 2
    if(category && category.parent) {
      const parentCategory = await Category.findOne({
        _id: category.parent,
        deleted: false,
        status: "active"
      })
      if(parentCategory) {
        breadcrumb.list.push({
          link: `/category/${parentCategory.slug}`,
          title: parentCategory.name
        })
      }
    }

    // Thêm category hiện tại
    if(category) {
      breadcrumb.list.push({
        link: `/category/${category.slug}`,
        title: category.name
      })
    }

    // Thêm thông tin tour
    breadcrumb.list.push({
      link: `/tour/detail/${slug}`,
      title: tourDetail.name
    })

    breadcrumb.image = tourDetail.avatar;
    breadcrumb.title = tourDetail.name;
    // End Breadcrumb

    // Thông tin chi tiết
    tourDetail.departureDateFormat = moment(tourDetail.departureDate).format("DD/MM/YYYY");

    const cityList = await City.find({
      _id: { $in: tourDetail.locations }
    })
    // Hết Thông tin chi tiết

    res.render("client/pages/tour-detail", {
      pageTitle: "Chi tiết tour",
      breadcrumb: breadcrumb,
      tourDetail: tourDetail,
      cityList: cityList
    });
  } else {
    res.redirect("/");
  }
}
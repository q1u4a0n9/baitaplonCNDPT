const moment = require("moment");
const Category = require("../../models/category.model");
const Tour = require("../../models/tour.model");

module.exports.list = async (req, res) => {
  // Lấy slug từ params
  const slug = req.params.slug;

  // Tìm category hiện tại theo slug
  const category = await Category.findOne({
    slug: slug,
    deleted: false,
    status: "active"
  })

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

  // Tìm category cha
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

    breadcrumb.image = category.avatar;
    breadcrumb.title = category.name;
  }
  // End Breadcrumb

  // Danh sách tour
  const allCategoryChildren = [];

  const getCategoryChilden = async (parentId) => {
    const childs = await Category.find({
      parent: parentId,
      status: "active",
      deleted: false
    })

    for (const child of childs) {
      allCategoryChildren.push(child.id);

      await getCategoryChilden(child.id);
    }
  }

  await getCategoryChilden(category.id);

  const tourListSection9 = await Tour
    .find({
      category: { $in: [category.id, ...allCategoryChildren] },
      status: "active",
      deleted: false
    })
    .sort({
      position: "desc"
    })

  for(const item of tourListSection9) {
    item.departureDateFormat = moment(item.departureDate).format("DD/MM/YYYY");
  }
  // Hết Danh sách tour

  res.render("client/pages/tour-list", {
    pageTitle: "Danh sách tour",
    breadcrumb: breadcrumb,
    category: category,
    tourListSection9: tourListSection9
  });
}
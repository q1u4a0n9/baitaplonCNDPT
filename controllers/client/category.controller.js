const Category = require("../../models/category.model");

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

  res.render("client/pages/tour-list", {
    pageTitle: "Danh sách tour",
    breadcrumb: breadcrumb
  });
}
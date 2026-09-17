const moment = require("moment");
const slugify = require('slugify');
const Category = require("../../models/category.model");
const City = require("../../models/city.model");
const Tour = require("../../models/tour.model");
const AccountAdmin = require("../../models/account-admin.model");

const categoryHelper = require("../../helpers/category.helper");

module.exports.list = async (req, res) => {
  const find = {
    deleted: false
  };

  // Lọc theo Trạng thái
  if(req.query.status) {
    find.status = req.query.status;
  }
  // Hết Lọc theo Trạng thái

  // Lọc theo Người tạo
  if(req.query.createdBy) {
    find.createdBy = req.query.createdBy;
  }
  // Hết Lọc theo Người tạo

  // Lọc theo Danh mục
  if(req.query.category) {
    find.category = req.query.category;
  }
  // Hết Lọc theo Danh mục

  // Lọc theo Ngày tạo
  const dateFilter = {};
  if(req.query.startDate) {
    const startDate = moment(req.query.startDate).startOf("day").toDate();
    dateFilter.$gte = startDate;
  }
  if(req.query.endDate) {
    const endDate = moment(req.query.endDate).startOf("day").toDate();
    dateFilter.$lte = endDate;
  }
  if(Object.keys(dateFilter).length > 0) {
    find.createdAt = dateFilter;
  }
  // Hết Lọc theo Ngày tạo

  // Lọc theo Mức giá (ưu tiên giá mới nếu có, giống cách hiển thị ở bảng)
  if(req.query.price) {
    const priceExpr = {
      $cond: [{ $gt: ["$priceNewAdult", 0] }, "$priceNewAdult", "$priceAdult"]
    };

    switch(req.query.price) {
      case "duoi-2tr":
        find.$expr = { $lt: [priceExpr, 2000000] };
        break;
      case "2-4tr":
        find.$expr = { $and: [{ $gte: [priceExpr, 2000000] }, { $lte: [priceExpr, 4000000] }] };
        break;
      case "4-8tr":
        find.$expr = { $and: [{ $gt: [priceExpr, 4000000] }, { $lte: [priceExpr, 8000000] }] };
        break;
      case "tren-8tr":
        find.$expr = { $gt: [priceExpr, 8000000] };
        break;
    }
  }
  // Hết Lọc theo Mức giá

  // Tìm kiếm
  if(req.query.keyword) {
    const keyword = slugify(req.query.keyword, {
      lower: true
    });
    const keywordRegex = new RegExp(keyword);
    find.slug = keywordRegex;
  }
  // Hết Tìm kiếm

  // Phân trang
  const limitItems = 9;
  let page = 1;
  if(req.query.page) {
    const currentPage = parseInt(req.query.page);
    if(currentPage > 0) {
      page = currentPage;
    }
  }
  const totalRecord = await Tour.countDocuments(find);
  const totalPage = Math.ceil(totalRecord/limitItems);
  const skip = (page - 1) * limitItems;
  const pagination = {
    skip: skip,
    totalRecord: totalRecord,
    totalPage: totalPage
  };
  // Hết Phân trang

  const tourList = await Tour
    .find(find)
    .sort({
      position: "desc"
    })
    .limit(limitItems)
    .skip(skip);

  for(const item of tourList) {
    if(item.createdBy) {
      const infoAccountCreated = await AccountAdmin.findOne({
        _id: item.createdBy
      });
      item.createdByFullName = infoAccountCreated.fullName;
    }

    if(item.updatedBy) {
      const infoAccountUpdated = await AccountAdmin.findOne({
        _id: item.updatedBy
      });
      item.updatedByFullName = infoAccountUpdated.fullName;
    }

    item.createdAtFormat = moment(item.createdAt).format("HH:mm - DD/MM/YYYY");
    item.updatedAtFormat = moment(item.updatedAt).format("HH:mm - DD/MM/YYYY");
  }

  // Danh sách tài khoản quản trị
  const accountAdminList = await AccountAdmin
    .find({})
    .select("id fullName");
  // Hết Danh sách tài khoản quản trị

  // Danh sách danh mục
  const categoryList = await Category.find({
    deleted: false
  });
  const categoryTree = categoryHelper.buildCategoryTree(categoryList, "");
  // Hết Danh sách danh mục

  res.render("admin/pages/tour-list", {
    pageTitle: "Quản lý tour",
    tourList: tourList,
    accountAdminList: accountAdminList,
    categoryList: categoryTree,
    pagination: pagination
  });
}

module.exports.create = async (req, res) => {
  const categoryList = await Category.find({
    deleted: false
  });

  const categoryTree = categoryHelper.buildCategoryTree(categoryList, "");

  const cityList = await City.find({});

  res.render("admin/pages/tour-create", {
    pageTitle: "Tạo tour",
    categoryList: categoryTree,
    cityList: cityList
  });
}

module.exports.createPost = async (req, res) => {
  if(req.role.permissions.includes("tour-create")) {
    if(req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalRecord = await Tour.countDocuments({});
      req.body.position = totalRecord + 1;
    }

    req.body.createdBy = req.account.id;
    req.body.updatedBy = req.account.id;
    if(req.files && req.files.avatar && req.files.avatar.length > 0) {
      req.body.avatar = req.files.avatar[0].path;
    } else {
      req.body.avatar = "";
    }
    req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
    req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
    req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
    req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : 0;
    req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : 0;
    req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : 0;
    req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
    req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
    req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
    req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
    req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
    req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

    if(req.files && req.files.images && req.files.images.length > 0) {
      req.body.images = req.files.images.map(file => file.path);
    } else {
      delete req.body.images;
    }

    const newRecord = new Tour(req.body);
    await newRecord.save();

    req.flash("success", "Tạo tour thành công!");

    res.json({
      code: "success"
    });
  } else {
    res.json({
      code: "error"
    });
  }
}

module.exports.trash = async (req, res) => {
  const find = {
    deleted: true
  };

  const tourList = await Tour
    .find(find)
    .sort({
      position: "desc"
    });

  for(const item of tourList) {
    if(item.deletedBy) {
      const infoAccountDeleted = await AccountAdmin.findOne({
        _id: item.deletedBy
      });
      item.deletedByFullName = infoAccountDeleted.fullName;
    }

    item.deletedAtFormat = moment(item.deletedAt).format("HH:mm - DD/MM/YYYY");
  }

  res.render("admin/pages/tour-trash", {
    pageTitle: "Thùng rác tour",
    tourList: tourList
  });
}

module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    const tourDetail = await Tour.findOne({
      _id: id,
      deleted: false
    });

    tourDetail.departureDateFormat = moment(tourDetail.departureDate).format('YYYY-MM-DD');

    const categoryList = await Category.find({
      deleted: false
    });

    const categoryTree = categoryHelper.buildCategoryTree(categoryList, "");

    const cityList = await City.find({});

    res.render("admin/pages/tour-edit", {
      pageTitle: "Chỉnh sửa tour",
      categoryList: categoryTree,
      cityList: cityList,
      tourDetail: tourDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/tour/list`);
  }
}

module.exports.editPatch = async (req, res) => {
  try {
    if(req.role.permissions.includes("tour-edit")) {
      const id = req.params.id;

      if(req.body.position) {
        req.body.position = parseInt(req.body.position);
      } else {
        const totalRecord = await Tour.countDocuments({});
        req.body.position = totalRecord + 1;
      }

      req.body.updatedBy = req.account.id;
      if(req.files && req.files.avatar && req.files.avatar.length > 0) {
        req.body.avatar = req.files.avatar[0].path;
      } else {
        delete req.body.avatar;
      }
      req.body.priceAdult = req.body.priceAdult ? parseInt(req.body.priceAdult) : 0;
      req.body.priceChildren = req.body.priceChildren ? parseInt(req.body.priceChildren) : 0;
      req.body.priceBaby = req.body.priceBaby ? parseInt(req.body.priceBaby) : 0;
      req.body.priceNewAdult = req.body.priceNewAdult ? parseInt(req.body.priceNewAdult) : 0;
      req.body.priceNewChildren = req.body.priceNewChildren ? parseInt(req.body.priceNewChildren) : 0;
      req.body.priceNewBaby = req.body.priceNewBaby ? parseInt(req.body.priceNewBaby) : 0;
      req.body.stockAdult = req.body.stockAdult ? parseInt(req.body.stockAdult) : 0;
      req.body.stockChildren = req.body.stockChildren ? parseInt(req.body.stockChildren) : 0;
      req.body.stockBaby = req.body.stockBaby ? parseInt(req.body.stockBaby) : 0;
      req.body.locations = req.body.locations ? JSON.parse(req.body.locations) : [];
      req.body.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : null;
      req.body.schedules = req.body.schedules ? JSON.parse(req.body.schedules) : [];

      if(req.files && req.files.images && req.files.images.length > 0) {
        req.body.images = req.files.images.map(file => file.path);
      } else {
        delete req.body.images;
      }

      await Tour.updateOne({
        _id: id,
        deleted: false
      }, req.body);

      req.flash("success", "Cập nhật tour thành công!");

      res.json({
        code: "success"
      });
    } else {
      res.json({
        code: "error"
      });
    }
  } catch (error) {
    res.json({
      code: "error",
      message: error
    })
  }
}

module.exports.deletePatch = async (req, res) => {
  try {
    if(req.role.permissions.includes("tour-delete")) {
      const id = req.params.id;

      await Tour.updateOne({
        _id: id
      }, {
        deleted: true,
        deletedAt: Date.now(),
        deletedBy: req.account.id
      });

      req.flash('success', 'Xóa tour thành công!');

      res.json({
        code: "success"
      });
    } else {
      res.json({
        code: "error"
      });
    }
  } catch (error) {
    res.json({
      code: "error",
      message: error
    });
  }
}

module.exports.undoPatch = async (req, res) => {
  try {
    if(req.role.permissions.includes("tour-trash")) {
      const id = req.params.id;

      await Tour.updateOne({
        _id: id
      }, {
        deleted: false
      });

      req.flash('success', 'Khôi phục tour thành công!');

      res.json({
        code: "success"
      });
    } else {
      res.json({
        code: "error"
      });
    }
  } catch (error) {
    res.json({
      code: "error",
      message: error
    });
  }
}

module.exports.changeMultiPatch = async (req, res) => {
  try {
    const { option, ids } = req.body;

    switch (option) {
      case "active":
      case "inactive":
        if(!req.role.permissions.includes("tour-edit")) {
          res.json({ code: "error" });
          return;
        }
        await Tour.updateMany({
          _id: { $in: ids }
        }, {
          status: option
        });
        req.flash("success", "Đổi trạng thái thành công!");
        break;
      case "delete":
        if(!req.role.permissions.includes("tour-delete")) {
          res.json({ code: "error" });
          return;
        }
        await Tour.updateMany({
          _id: { $in: ids }
        }, {
          deleted: true,
          deletedAt: Date.now(),
          deletedBy: req.account.id
        });
        req.flash("success", "Xóa thành công!");
        break;
    }

    res.json({
      code: "success"
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Cập nhật không thành công!"
    });
  }
}

module.exports.deleteDestroyPatch = async (req, res) => {
  try {
    if(req.role.permissions.includes("tour-trash")) {
      const id = req.params.id;

      await Tour.deleteOne({
        _id: id
      });

      req.flash('success', 'Đã xóa vĩnh viễn tour!');

      res.json({
        code: "success"
      });
    } else {
      res.json({
        code: "error"
      });
    }
  } catch (error) {
    res.json({
      code: "error",
      message: error
    });
  }
}
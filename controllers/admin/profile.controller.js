const bcrypt = require("bcryptjs");
const AccountAdmin = require("../../models/account-admin.model");
const Role = require("../../models/role.model");
const { pick } = require("../../helpers/object.helper");

module.exports.edit = async (req, res) => {
  const profileDetail = await AccountAdmin.findOne({
    _id: req.account.id
  });

  if(profileDetail) {
    const roleInfo = await Role.findOne({
      _id: profileDetail.role
    });

    profileDetail.roleName = roleInfo.name;
  }

  res.render("admin/pages/profile-edit", {
    pageTitle: "Thông tin cá nhân",
    profileDetail: profileDetail
  });
}

module.exports.editPatch = async (req, res) => {
  try {
    const id = req.account.id;

    // Không có role và status: người dùng không được tự nâng quyền cho chính mình
    const profileData = pick(req.body, ["fullName", "email", "phone"]);
    profileData.updatedBy = req.account.id;
    if(req.file) {
      profileData.avatar = req.file.path;
    }

    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, profileData);

    req.flash('success', 'Cập nhật thông tin thành công!');

    res.json({
      code: "success"
    });
  } catch (error) {
    res.json({
      code: "error",
      message: error
    });
  }
}

module.exports.changePassword = async (req, res) => {
  res.render("admin/pages/profile-change-password", {
    pageTitle: "Đổi mật khẩu"
  });
}

module.exports.changePasswordPatch = async (req, res) => {
  try {
    const id = req.account.id;

    // Mã hóa mật khẩu với bcrypt
    const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
    const password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu

    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, {
      password: password,
      updatedBy: req.account.id
    });

    req.flash('success', 'Đổi mật khẩu thành công!');

    res.json({
      code: "success"
    });
  } catch (error) {
    res.json({
      code: "error",
      message: error
    });
  }
}
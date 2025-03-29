const AccountAdmin = require("../../models/account-admin.model");
const Role = require("../../models/role.model");

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

    req.body.updatedBy = req.account.id;
    if(req.file) {
      req.body.avatar = req.file.path;
    } else {
      delete req.body.avatar;
    }

    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, req.body);

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
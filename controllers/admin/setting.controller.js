const bcrypt = require("bcryptjs");
const SettingWebsiteInfo = require("../../models/setting-website-info.model");
const Role = require("../../models/role.model");
const AccountAdmin = require("../../models/account-admin.model");

const permissionConfig = require("../../config/permission");
const { pick } = require("../../helpers/object.helper");

// role và status nằm trong danh sách vì form cần gán chúng cho tài khoản khác.
// Hai route dùng danh sách này đều yêu cầu quyền account-admin-manage.
const ACCOUNT_ADMIN_FIELDS = ["fullName", "email", "phone", "role", "positionCompany", "status"];

// Chỉ giữ các quyền có thật trong config, bỏ mọi giá trị tự đặt
const getRoleData = (body) => {
  const validPermissions = permissionConfig.permissionList.map(item => item.value);
  const permissions = Array.isArray(body.permissions) ? body.permissions : [];

  return {
    ...pick(body, ["name", "description"]),
    permissions: permissions.filter(item => validPermissions.includes(item))
  };
}

module.exports.list = async (req, res) => {
  res.render("admin/pages/setting-list", {
    pageTitle: "Cài đặt chung"
  });
}

module.exports.websiteInfo = async (req, res) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({}) || {};

  res.render("admin/pages/setting-website-info", {
    pageTitle: "Thông tin website",
    settingWebsiteInfo: settingWebsiteInfo
  });
}

module.exports.websiteInfoPatch = async (req, res) => {
  if(Object.keys(req.files).length > 0) {
    if(req.files.logo) {
      req.body.logo = req.files.logo[0].path;
    } else {
      delete req.body.logo;
    }

    if(req.files.favicon) {
      req.body.favicon = req.files.favicon[0].path;
    } else {
      delete req.body.favicon;
    }
  } else {
    delete req.body.logo;
    delete req.body.favicon;
  }

  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  if(!settingWebsiteInfo) {
    const newRecord = new SettingWebsiteInfo(req.body);
    await newRecord.save();
  } else {
    await SettingWebsiteInfo.updateOne({
      _id: settingWebsiteInfo.id
    }, req.body);
  }

  req.flash('success', 'Cập nhật thành công!');

  res.json({
    code: 'success'
  })
}

module.exports.effect = async (req, res) => {
  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({}) || {};

  res.render("admin/pages/setting-effect", {
    pageTitle: "Hiệu ứng",
    settingWebsiteInfo: settingWebsiteInfo
  });
}

module.exports.effectPatch = async (req, res) => {
  const sakuraEffect = req.body.sakuraEffect === true;

  const settingWebsiteInfo = await SettingWebsiteInfo.findOne({});
  if(!settingWebsiteInfo) {
    const newRecord = new SettingWebsiteInfo({ sakuraEffect: sakuraEffect });
    await newRecord.save();
  } else {
    await SettingWebsiteInfo.updateOne({
      _id: settingWebsiteInfo.id
    }, {
      sakuraEffect: sakuraEffect
    });
  }

  req.flash('success', 'Cập nhật hiệu ứng thành công!');

  res.json({
    code: "success"
  });
}

module.exports.accountAdminList = async (req, res) => {
  const accountAdminList = await AccountAdmin
    .find({
      deleted: false
    }).sort({
      createdAt: "desc"
    });

  for(const item of accountAdminList) {
    if(item.role) {
      const roleInfo = await Role.findOne({
        _id: item.role
      });

      if(roleInfo) {
        item.roleName = roleInfo.name;
      }
    }
  }

  res.render("admin/pages/setting-account-admin-list", {
    pageTitle: "Tài khoản quản trị",
    accountAdminList: accountAdminList
  });
}

module.exports.accountAdminCreate = async (req, res) => {
  const roleList = await Role.find({
    deleted: false
  });

  res.render("admin/pages/setting-account-admin-create", {
    pageTitle: "Tạo tài khoản quản trị",
    roleList: roleList
  });
}

module.exports.accountAdminCreatePost = async (req, res) => {
  const accountData = pick(req.body, ACCOUNT_ADMIN_FIELDS);
  accountData.createdBy = req.account.id;
  accountData.updatedBy = req.account.id;
  accountData.avatar = req.file ? req.file.path : "";

  const existAccount = await AccountAdmin.findOne({
    email: accountData.email
  });

  if(existAccount) {
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!"
    });
    return;
  }

  // Mã hóa mật khẩu với bcrypt
  const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
  accountData.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu

  const newAccount = new AccountAdmin(accountData);
  await newAccount.save();

  req.flash('success', 'Tạo tài khoản quản trị thành công!');

  res.json({
    code: "success"
  });
}

module.exports.accountAdminEdit = async (req, res) => {
  try {
    const roleList = await Role.find({
      deleted: false
    });

    const id = req.params.id;
    const accountAdminDetail = await AccountAdmin.findOne({
      _id: id,
      deleted: false
    });
  
    res.render("admin/pages/setting-account-admin-edit", {
      pageTitle: "Chỉnh sửa tài khoản quản trị",
      roleList: roleList,
      accountAdminDetail: accountAdminDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
}

module.exports.accountAdminEditPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const accountData = pick(req.body, ACCOUNT_ADMIN_FIELDS);
    accountData.updatedBy = req.account.id;
    if(req.file) {
      accountData.avatar = req.file.path;
    }

    // Mã hóa mật khẩu với bcrypt
    if(req.body.password) {
      const salt = await bcrypt.genSalt(10); // Tạo salt - Chuỗi ngẫu nhiên có 10 ký tự
      accountData.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu
    }

    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, accountData);

    req.flash('success', 'Cập nhật tài khoản quản trị thành công!');

    res.json({
      code: "success"
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/account-admin/list`);
  }
}

module.exports.roleList = async (req, res) => {
  const roleList = await Role.find({
    deleted: false
  });

  res.render("admin/pages/setting-role-list", {
    pageTitle: "Nhóm quyền",
    roleList: roleList
  });
}

module.exports.roleCreate = async (req, res) => {
  res.render("admin/pages/setting-role-create", {
    pageTitle: "Tạo nhóm quyền",
    permissionList: permissionConfig.permissionList
  });
}

module.exports.roleCreatePost = async (req, res) => {
  const roleData = getRoleData(req.body);
  roleData.createdBy = req.account.id;
  roleData.updatedBy = req.account.id;

  const newRecord = new Role(roleData);
  await newRecord.save();

  req.flash("success", "Tạo nhóm quyền thành công!");

  res.json({
    code: "success"
  })
}

module.exports.roleEdit = async (req, res) => {
  try {
    const id = req.params.id;

    const roleDetail = await Role.findOne({
      _id: id,
      deleted: false
    });

    res.render("admin/pages/setting-role-edit", {
      pageTitle: "Chỉnh sửa nhóm quyền",
      permissionList: permissionConfig.permissionList,
      roleDetail: roleDetail
    });
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/role/list`);
  }
}

module.exports.roleEditPatch = async (req, res) => {
  try {
    const id = req.params.id;

    const roleData = getRoleData(req.body);
    roleData.updatedBy = req.account.id;

    await Role.updateOne({
      _id: id,
      deleted: false
    }, roleData);

    req.flash('success', 'Cập nhật nhóm quyền thành công!');

    res.json({
      code: 'success'
    })
  } catch (error) {
    res.redirect(`/${pathAdmin}/setting/role/list`);
  }
}
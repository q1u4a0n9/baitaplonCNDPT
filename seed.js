const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Role = require("./models/role.model");
const AccountAdmin = require("./models/account-admin.model");
const permissionConfig = require("./config/permission");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log("1. Kết nối DB thành công!");

    await Role.deleteMany({});
    await AccountAdmin.deleteMany({});

    const allPermissions = permissionConfig.permissionList.map(item => item.value);

    const newRole = new Role({
      name: "Super Admin",
      description: "Quản trị viên toàn quyền",
      permissions: allPermissions
    });
    const savedRole = await newRole.save();
    console.log("2. Đã tạo nhóm quyền Super Admin!");

    const newAdmin = new AccountAdmin({
      fullName: "Admin Tổng",
      email: "admin@gmail.com",
      password: await bcrypt.hash("123456", 10),
      role: savedRole._id,
      status: "active"
    });
    await newAdmin.save();

    console.log("✅ Tạo tài khoản thành công!");
    console.log("👉 Email: admin@gmail.com");
    console.log("👉 Mật khẩu: 123456");
    process.exit(0);
  } catch (error) {
    console.log("❌ Có lỗi xảy ra:", error);
    process.exit(1);
  }
};

seedAdmin();

// Chạy MỘT LẦN trước khi deploy bản có checkPermission. Các nhóm quyền trong DB chưa
// có quyền mới, nên nếu deploy trước thì admin sẽ bị chặn khỏi chính trang sửa nhóm quyền.
//
//   node scripts/grant-permissions.js                  Chỉ liệt kê, không ghi gì vào DB
//   node scripts/grant-permissions.js "Tên nhóm quyền"  Cấp các quyền mới cho nhóm đó
require("dotenv").config();
const mongoose = require("mongoose");
const Role = require("../models/role.model");

const NEW_PERMISSIONS = [
  "order-edit",
  "setting-edit",
  "account-admin-manage",
  "role-manage",
  "upload",
  "profile-edit"
];

const main = async () => {
  await mongoose.connect(process.env.DATABASE);

  const roleName = process.argv[2];

  if(!roleName) {
    const roleList = await Role.find({ deleted: false });
    console.log("Các nhóm quyền hiện có:");
    roleList.forEach(role => console.log(`- ${role.name} (${role.permissions.length} quyền)`));
    return;
  }

  // $addToSet bỏ qua quyền đã có, nên chạy lại nhiều lần vẫn an toàn
  const result = await Role.updateOne({
    name: roleName,
    deleted: false
  }, {
    $addToSet: { permissions: { $each: NEW_PERMISSIONS } }
  });

  console.log(result.matchedCount ? `Đã cấp quyền mới cho nhóm "${roleName}".` : `Không tìm thấy nhóm "${roleName}".`);
}

main()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

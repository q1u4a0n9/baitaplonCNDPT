// Chỉ lấy các trường được phép từ dữ liệu người dùng gửi lên. Không truyền thẳng
// req.body vào model, vì người gửi có thể tự thêm trường như deleted hay total.
module.exports.pick = (source, allowedFields) => {
  const result = {};

  for(const field of allowedFields) {
    if(source[field] !== undefined) {
      result[field] = source[field];
    }
  }

  return result;
}

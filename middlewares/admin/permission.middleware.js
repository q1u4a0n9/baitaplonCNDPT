// Kiểm tra quyền ngay tại route. Trên route có upload phải đặt trước multer,
// nếu không file đã lên Cloudinary rồi mới bị từ chối.
module.exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if(req.role.permissions.includes(permission)) {
      next();
      return;
    }

    res.status(403).json({
      code: "error",
      message: "Bạn không có quyền thực hiện thao tác này!"
    });
  };
}

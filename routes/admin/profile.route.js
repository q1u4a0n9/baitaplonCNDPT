const router = require("express").Router();
const profileController = require("../../controllers/admin/profile.controller");
const multer  = require('multer');

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const { checkPermission, checkPagePermission } = require("../../middlewares/admin/permission.middleware");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/edit', profileController.edit)

router.patch('/edit', checkPermission("profile-edit"), upload.single('avatar'), profileController.editPatch)

router.get('/change-password', checkPagePermission("profile-edit"), profileController.changePassword)

router.patch('/change-password', checkPermission("profile-edit"), profileController.changePasswordPatch)

module.exports = router;
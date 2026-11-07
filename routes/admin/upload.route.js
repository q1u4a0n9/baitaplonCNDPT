const router = require("express").Router();
const uploadController = require("../../controllers/admin/upload.controller");
const multer  = require('multer');

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const { checkPermission } = require("../../middlewares/admin/permission.middleware");

const upload = multer({ storage: cloudinaryHelper.storage });

router.post('/image', checkPermission("upload"), upload.single('file'), uploadController.imagePost)

module.exports = router;
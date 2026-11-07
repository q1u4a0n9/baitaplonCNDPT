const router = require("express").Router();
const categoryController = require("../../controllers/admin/category.controller");
const multer  = require('multer');

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const { checkPermission } = require("../../middlewares/admin/permission.middleware");

const categoryValidate = require("../../validates/admin/category.validate");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/list', categoryController.list)

router.get('/create', categoryController.create)

router.post('/create', checkPermission("category-create"), upload.single('avatar'), categoryValidate.createPost, categoryController.createPost)

router.get('/edit/:id', categoryController.edit)

router.patch('/edit/:id', checkPermission("category-edit"), upload.single('avatar'), categoryValidate.createPost, categoryController.editPatch)

router.patch('/delete/:id', categoryController.deletePatch)

router.patch('/change-multi', categoryController.changeMultiPatch)

module.exports = router;
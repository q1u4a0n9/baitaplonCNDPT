const router = require("express").Router();
const settingController = require("../../controllers/admin/setting.controller");
const multer  = require('multer');

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const { checkPermission, checkPagePermission } = require("../../middlewares/admin/permission.middleware");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/list', checkPagePermission("setting-view"), settingController.list)

router.get('/website-info', checkPagePermission("setting-view"), settingController.websiteInfo)

router.patch(
  '/website-info',
  checkPermission("setting-edit"),
  upload.fields([
    {
      name: 'logo',
      maxCount: 1
    },
    {
      name: 'favicon',
      maxCount: 1
    }
  ]), 
  settingController.websiteInfoPatch
)

router.get('/effect', checkPagePermission("setting-view"), settingController.effect)

router.patch('/effect', checkPermission("setting-edit"), settingController.effectPatch)

router.get('/account-admin/list', checkPagePermission("setting-view"), settingController.accountAdminList)

router.get('/account-admin/create', checkPagePermission("account-admin-manage"), settingController.accountAdminCreate)

router.post('/account-admin/create', checkPermission("account-admin-manage"), upload.single("avatar"), settingController.accountAdminCreatePost)

router.get('/account-admin/edit/:id', checkPagePermission("account-admin-manage"), settingController.accountAdminEdit)

router.patch('/account-admin/edit/:id', checkPermission("account-admin-manage"), upload.single("avatar"), settingController.accountAdminEditPatch)

router.get('/role/list', checkPagePermission("setting-view"), settingController.roleList)

router.get('/role/create', checkPagePermission("role-manage"), settingController.roleCreate)

router.post('/role/create', checkPermission("role-manage"), settingController.roleCreatePost)

router.get('/role/edit/:id', checkPagePermission("setting-view"), settingController.roleEdit)

router.patch('/role/edit/:id', checkPermission("role-manage"), settingController.roleEditPatch)

module.exports = router;
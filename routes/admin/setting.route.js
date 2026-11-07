const router = require("express").Router();
const settingController = require("../../controllers/admin/setting.controller");
const multer  = require('multer');

const cloudinaryHelper = require("../../helpers/cloudinary.helper");
const { checkPermission } = require("../../middlewares/admin/permission.middleware");

const upload = multer({ storage: cloudinaryHelper.storage });

router.get('/list', settingController.list)

router.get('/website-info', settingController.websiteInfo)

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

router.get('/effect', settingController.effect)

router.patch('/effect', checkPermission("setting-edit"), settingController.effectPatch)

router.get('/account-admin/list', settingController.accountAdminList)

router.get('/account-admin/create', settingController.accountAdminCreate)

router.post('/account-admin/create', checkPermission("account-admin-manage"), upload.single("avatar"), settingController.accountAdminCreatePost)

router.get('/account-admin/edit/:id', settingController.accountAdminEdit)

router.patch('/account-admin/edit/:id', checkPermission("account-admin-manage"), upload.single("avatar"), settingController.accountAdminEditPatch)

router.get('/role/list', settingController.roleList)

router.get('/role/create', settingController.roleCreate)

router.post('/role/create', checkPermission("role-manage"), settingController.roleCreatePost)

router.get('/role/edit/:id', settingController.roleEdit)

router.patch('/role/edit/:id', checkPermission("role-manage"), settingController.roleEditPatch)

module.exports = router;
const jwt = require('jsonwebtoken');
const AccountAdmin = require('../../models/account-admin.model');
const Role = require('../../models/role.model');

module.exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if(!token) {
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = decoded;

    const existAccount = await AccountAdmin.findOne({
      _id: id,
      email: email,
      status: "active"
    });

    if(!existAccount) {
      res.clearCookie("token");
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }

    const roleInfo = await Role.findOne({
      _id: existAccount.role
    });

    if(!roleInfo) {
      res.clearCookie("token");
      res.redirect(`/${pathAdmin}/account/login`);
      return;
    }

    req.account = existAccount;
    req.role = roleInfo;
    res.locals.account = {
      fullName: existAccount.fullName,
      avatar: existAccount.avatar,
      roleName: roleInfo.name,
      permissions: roleInfo.permissions
    };

    next();
  } catch (error) {
    res.clearCookie("token");
    res.redirect(`/${pathAdmin}/account/login`);
  }
}

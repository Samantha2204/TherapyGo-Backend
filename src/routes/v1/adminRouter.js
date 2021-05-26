const Router = require("koa-router");
const config = require("../../config/app");
const jwt = require("koa-jwt");
const adminController = require(`../../controllers/${config.api.prefix}/adminController`);
const customerController = require(`../../controllers/${config.api.prefix}/customerController`);

const adminRouter = new Router();

const auth = jwt({ secret: config.JWT_SECRET });

adminRouter.get("/admin", adminController.adminList);

adminRouter.get("/admin/checkemail/:email", adminController.isExists);

adminRouter.post(
  "/admin/login",
  customerController.login,
  adminController.login
);

adminRouter.post("/admin/signup", customerController.signup);

adminRouter.get(
  "/admin/activateaccount/:token",
  adminController.activateAccount
);

adminRouter.put(
  "/admin/updatepassword",
  customerController.updatePassword,
  adminController.updatePassword
);

adminRouter.post(
  "/admin/forgotpassword",
  customerController.forgotPassword,
  adminController.forgotPassword
);

adminRouter.get(
  "/admin/resetpassword/:admin_id/:resetPasswordToken",
  adminController.collectPassword
);

adminRouter.post(
  "/admin/resetpassword/:admin_id/:resetPasswordToken",
  adminController.resetPassword
);

adminRouter.delete("/admin/delete/:id", adminController.deleteOne);

module.exports = adminRouter;

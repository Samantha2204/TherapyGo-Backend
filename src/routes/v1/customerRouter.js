const Router = require("koa-router");
const config = require("../../config/app");

const customerController = require(`../../controllers/${config.api.prefix}/customerController`);

const customerRouter = new Router();

customerRouter.get("/customer", customerController.customerList);

customerRouter.get("/customer/checkemail", customerController.isExisting);

customerRouter.post("/customer/login", customerController.login);

customerRouter.post("/customer/signup", customerController.signup);

customerRouter.get(
  "/customer/activateaccount/:token",
  customerController.activateAccount
);

customerRouter.put(
  "/customer/updatepassword",
  customerController.updatePassword
);

customerRouter.post(
  "/customer/forgotpassword",
  customerController.forgotPassword
);

customerRouter.get(
  "/customer/resetpassword/:customer_id/:resetPasswordToken",
  customerController.collectPassword
);

customerRouter.post(
  "/customer/resetpassword/:customer_id/:resetPasswordToken",
  customerController.resetPassword
);

customerRouter.delete(
  "/customer/delete/:customer_id",
  customerController.deleteOne
);

customerRouter.get(
  "/customer/:customer_id/orderhistory",
  customerController.displayOrderHistory
);

customerRouter.get(
  "/customer/displayPersonalProfile/:customer_id",
  customerController.displayPersonalProfile
);

customerRouter.put(
  "/customer/updatePersonalProfile/:customer_id",
  customerController.updatePersonalProfile
);

module.exports = customerRouter;

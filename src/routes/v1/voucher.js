const Router = require("koa-router");
const config = require("../../config/app");
const voucherController = require(`../../controllers/${config.api.prefix}/voucherController`);

const voucherRouter = new Router();

voucherRouter.get("/voucher", voucherController.index);
voucherRouter.post("/voucher", voucherController.store);

module.exports = voucherRouter;
const Router = require("koa-router");
const config = require("../../config/app");
const revenueController = require(`../../controllers/${config.api.prefix}/revenueController`);

const revenueRouter = new Router();

revenueRouter.get("/revenue", revenueController.index);
revenueRouter.get("/revenue/:date", revenueController.showDailyRevenue);
revenueRouter.post("/revenue", revenueController.store);

module.exports = revenueRouter;
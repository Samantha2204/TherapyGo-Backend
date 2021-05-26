const config = require('../../config/app');
const paymentController = require(`../../controllers/${config.api.prefix}/paymentController`);

const koaRouter = require('koa-router');
const paymentRouter = new koaRouter();
paymentRouter.get("/payments", paymentController.index);
paymentRouter.post("/payments", paymentController.store);
paymentRouter.get("/payments/:id", paymentController.show);

module.exports = paymentRouter;
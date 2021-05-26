const config = require('../../config/app');
const roomController = require(`../../controllers/${config.api.prefix}/roomController`);

const koaRouter = require('koa-router');
const roomRouter = new koaRouter();

roomRouter.get("/rooms", roomController.index);
roomRouter.post("/rooms", roomController.store);
roomRouter.get("/rooms/:id", roomController.show);

module.exports = roomRouter;
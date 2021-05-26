const Router = require('koa-router');
const config = require('../../config/app');
const { checkAdmin } = require('../../middleware/checkAdmin');
const serviceController = require(`../../controllers/${config.api.prefix}/serviceController`)

const serviceRouter = new Router();

serviceRouter.get('/services',serviceController.index)
serviceRouter.post('/services', serviceController.store);
serviceRouter.get('/services/:id', serviceController.show);
serviceRouter.post('/services/:id', serviceController.update);
serviceRouter.get('/searchServices/:mobile',  serviceController.searchService);

module.exports = serviceRouter;
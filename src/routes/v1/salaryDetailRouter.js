const Router = require('koa-router');
const config = require('../../config/app');
const salaryDetailController = require(`../../controllers/${config.api.prefix}/salaryDetailController`)

const salaryDetailRouter = new Router();

salaryDetailRouter.get('/salaryDetail', salaryDetailController.index)
salaryDetailRouter.post('/salaryDetail', salaryDetailController.store);
salaryDetailRouter.get('/salaryDetail/:id', salaryDetailController.show);
salaryDetailRouter.delete('/salaryDetail/:id', salaryDetailController.delete);
salaryDetailRouter.post('/salaryDetail/:id', salaryDetailController.update);


module.exports = salaryDetailRouter;
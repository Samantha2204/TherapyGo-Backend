const Router = require('koa-router');
const config = require('../../config/app');
const customerLoginController = require(`../../controllers/${config.api.prefix}/customerLoginController`)

const customerLoginRouter = new Router();

customerLoginRouter.get('/login',customerLoginController.index)
customerLoginRouter.post('/login', customerLoginController.verify);

module.exports = customerLoginRouter; 



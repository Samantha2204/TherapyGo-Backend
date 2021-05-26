const Router = require('koa-router');
const config = require('../../config/app');
const therapistController = require(`../../controllers/${config.api.prefix}/therapistController`)

const therapistRouter = new Router();

therapistRouter.get('/therapist',therapistController.index)
therapistRouter.post('/therapist', therapistController.store);
therapistRouter.get('/therapist/:id', therapistController.show);
therapistRouter.delete('/therapist/:id', therapistController.delete);
therapistRouter.post('/therapist/:id', therapistController.update);

therapistRouter.post('/addStaff', therapistController.addStaff);
therapistRouter.get('/getStaff', therapistController.getStaff);
therapistRouter.get('/getStaff/:id', therapistController.getOneStaff);
therapistRouter.put('/updateStaff/:id', therapistController.updateStaff);

module.exports = therapistRouter;
const Router = require('koa-router');
const config = require('../../config/app');
const treatmentController = require(`../../controllers/${config.api.prefix}/treatmentController`)

const treatmentRouter = new Router();

treatmentRouter.get('/treatment',treatmentController.index)
treatmentRouter.post('/treatment', treatmentController.store);
treatmentRouter.get('/treatment/:id', treatmentController.show);
treatmentRouter.delete('/treatment/:id', treatmentController.delete);
treatmentRouter.post('/treatment/:id', treatmentController.update);
treatmentRouter.get('/treatmentList', treatmentController.getAllTreatments);
module.exports = treatmentRouter;
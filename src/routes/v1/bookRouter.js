const Router = require('koa-router');
const config = require('../../config/app');
const bookController = require(`../../controllers/${config.api.prefix}/bookController`)
const { checkAdmin } = require('../../middleware/checkAdmin');
const bookRouter = new Router();

bookRouter.post('/staffBook',checkAdmin, bookController.staffAddService);
bookRouter.post('/customerBook', bookController.customerAddService);
bookRouter.post('/goStart', bookController.start);
bookRouter.put("/update/:id", bookController.update);
bookRouter.delete("/staffDeleteService/:id", checkAdmin,bookController.staffDeleteService);
bookRouter.delete("/customerDeleteService/:id", bookController.customerDeleteService);
bookRouter.get('/notifications', bookController.getNotifications)
bookRouter.put('/updateNotification', bookController.updateNotification)
module.exports = bookRouter;
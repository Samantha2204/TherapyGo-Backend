const Router = require('koa-router');
const config = require('../../config/app');
const { checkAdmin } = require('../../middleware/checkAdmin');
const ScheduleController = require(`../../controllers/${config.api.prefix}/scheduleController`)

const ScheduleRouter = new Router();

ScheduleRouter.get('/schedule', ScheduleController.index)
ScheduleRouter.post('/schedule', ScheduleController.store);
ScheduleRouter.get('/schedule/:id', ScheduleController.show);
ScheduleRouter.delete('/schedule/:id', ScheduleController.delete);
ScheduleRouter.post('/schedule/:id', ScheduleController.update);
ScheduleRouter.get('/schedule/existAppointment/:date', checkAdmin,ScheduleController.findWorkSheetInformation);
ScheduleRouter.get('/allStaffs',  checkAdmin,ScheduleController.findAllStaffs);
ScheduleRouter.get('/findWeekStaffList/:date', checkAdmin, ScheduleController.findWeekStaffList);
ScheduleRouter.put('/updateTodayStaffList/:date', checkAdmin, ScheduleController.updateTodayStaffList);

module.exports = ScheduleRouter;
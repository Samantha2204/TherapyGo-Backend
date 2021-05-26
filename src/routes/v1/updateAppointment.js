const Router = require('koa-router');
const config = require('../../config/app');
const { checkAdmin } = require('../../middleware/checkAdmin');
const updateAppointmentController = require(`../../controllers/${config.api.prefix}/updateAppointmentController`)

const updateAppointmentRouter = new Router();


updateAppointmentRouter.get('/selectedDate/:date/selectedTime/:time/selectedTreatmentTime/:treatmentDuration/id/:id', updateAppointmentController.findTherapists);

updateAppointmentRouter.get('/selectedDate/:date/selectedTime/:time/id/:id', updateAppointmentController.findTherapistWithTimeAndDate);

updateAppointmentRouter.get('/selectedDate/:date/selectedTime/:time/selectedRoom/:roomName/selectedTherapist/:therapistName/id/:id', updateAppointmentController.findTreatments);

updateAppointmentRouter.get('/selectedDate/:date/selectedTime/:time/selectedRoom/:roomName/id/:id', updateAppointmentController.findTreatmentsWithRoomName);


module.exports = updateAppointmentRouter;
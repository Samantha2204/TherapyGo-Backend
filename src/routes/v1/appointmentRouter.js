const Router = require("koa-router");
const config = require("../../config/app");
const { checkAdmin } = require("../../middleware/checkAdmin");
const appointmentController = require(`../../controllers/${config.api.prefix}/appointmentController`);

const appointmentRouter = new Router();

appointmentRouter.get(
  "/selectedDate/:date/selectedTime/:time/selectedTreatmentTime/:treatmentDuration",
  appointmentController.findTherapists
);

appointmentRouter.get(
  "/selectedDate/:date/selectedTime/:time",
  appointmentController.findTherapistWithTimeAndDate
);

appointmentRouter.get(
  "/selectedDate/:date/selectedTime/:time/selectedRoom/:roomName/selectedTherapist/:therapistName",
  appointmentController.findTreatments
);

appointmentRouter.get(
  "/selectedDate/:date/selectedTime/:time/selectedRoom/:roomName",
  appointmentController.findTreatmentsWithRoomName
);

appointmentRouter.post(
  "/treatmentPrice",
  appointmentController.findDefaultPrice
);

appointmentRouter.get(
  "/date/:date",
  appointmentController.checkAvailableAppointment
);

appointmentRouter.get(
  "/date/:date/startTime/:time/duration/:duration",
  appointmentController.checkAvailableRooms
);

module.exports = appointmentRouter;

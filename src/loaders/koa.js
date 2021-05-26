const cors = require("koa-cors");
const apiRouter = require("../../src/routes/v1/api");
const config = require("../../src/config/app");

const adminRouter = require(`../../src/${config.router.prefix}/adminRouter`);
const therapistRouter = require(`../../src/${config.router.prefix}/therapistRouter`);
const salaryDetailRouter = require(`../../src/${config.router.prefix}/salaryDetailRouter`);
const treatmentRouter = require(`../../src/${config.router.prefix}/treatmentRouter`);
const customerRouter = require(`../../src/${config.router.prefix}/customerRouter`);
const paymentRouter = require(`../../src/${config.router.prefix}/payment`);
const revenueRouter = require(`../../src/${config.router.prefix}/revenue`);
const voucherRouter = require(`../../src/${config.router.prefix}/voucher`);
const serviceRouter = require(`../../src/${config.router.prefix}/serviceRouter`);
const roomRouter = require(`../../src/${config.router.prefix}/roomRouter`);
const scheduleRouter = require(`../../src/${config.router.prefix}/scheduleRouter`);
const appointmentRouter = require(`../../src/${config.router.prefix}/appointmentRouter`);
const bookRouter = require(`../../src/${config.router.prefix}/bookRouter`);
const updateAppointmentRouter = require(`../../src/${config.router.prefix}/updateAppointment`);

module.exports = async (app) => {
  app.use(cors());
  app.use(apiRouter.routes());
  app.use(adminRouter.routes());
  app.use(therapistRouter.routes());
  app.use(salaryDetailRouter.routes());
  app.use(treatmentRouter.routes());
  app.use(customerRouter.routes());
  app.use(paymentRouter.routes());
  app.use(revenueRouter.routes());
  app.use(voucherRouter.routes());
  app.use(serviceRouter.routes());
  app.use(roomRouter.routes());
  app.use(scheduleRouter.routes());
  app.use(appointmentRouter.routes());
  app.use(bookRouter.routes());
  app.use(updateAppointmentRouter.routes());

  return app;
};

const Revenue = require("../../../model/RevenueModel");
const Service = require("../../../model/ServiceModel");
const TreatmentDB = require("../../../model/TreatmentModel");
const Schedule = require("../../../model/ScheduleModel");
const TherapistDB = require("../../../model/TherapistModel");

exports.index = async (ctx) => {
  try {
    await Revenue.find({}, (err, users) => {
      ctx.body = users;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.store = async (ctx) => {
  const revenue = new Revenue(ctx.request.body);

  try {
    await revenue.save();
    const msg = `Revenue (${revenue._id}) on ${ctx.request.body.revenue_date}  has been saved successfully`;
    ctx.status = 201;
    ctx.body = msg;
  } catch (e) {
    ctx.body = e;
  }
};

exports.showDailyRevenue = async (ctx) => {
  try {
    const date = ctx.params.date;
    const res = await Schedule.find({ date });
    let dailyServicesForStaff = [];

    if (res.length != 0) {
      const therapistList = res[0].therapistId;
      for (i = 0; i < therapistList.length; i++) {
        const therapist = await TherapistDB.find({ _id: therapistList[i] });
        let therapistFirstname = therapist[0]["firstName"];
        let therapistLastname = therapist[0]["lastName"];
        let therapistFullname = therapistFirstname + therapistLastname;
        let services = await Service.find({
          therapistId: therapistList[i],
        }).populate({
          path: "therapistId treatmentId paymentId",
          select: [
            "treatmentPrice",
            "treatmentStyle",
            "treatmentDuration",
            "isPaid",
            "method",
            "amount",
          ],
        });
        let serviceList = [];
        let totalPersonalDailyIncome = 0;
        let totalPersonalDailyUnpaid = 0;

        getDetailedServiceInfo = (service) => {
          const time = service.time + "-" + service.endTime;
          const item =
            service.treatmentId.treatmentDuration +
            "-" +
            service.treatmentId.treatmentStyle;
          const pay = service.paymentId.isPaid
            ? service.paymentId.amount
            : "unpaid";
          const price = service.treatmentId.treatmentPrice;
          serviceInfo = {
            time,
            item,
            pay,
            price,
          };
          totalPersonalDailyIncome += price;
          if (!service.paymentId.isPaid) {
            totalPersonalDailyUnpaid += price;
          }
          serviceList.push(serviceInfo);
        };
        services.forEach(getDetailedServiceInfo);
        let dailyServicesForAstaff = {
          Name: therapistFullname,
          Services: serviceList,
          totalPersonalDailyIncome,
          totalPersonalDailyUnpaid,
        };
        dailyServicesForStaff.push(dailyServicesForAstaff);
      }

      ctx.body = dailyServicesForStaff;
    } else {
      ctx.status = 404;
      return (ctx.body = {
        code: 404,
        message: `No services found on ${date}!`,
      });
    }
  } catch (e) {
    ctx.body = e;
  }
};

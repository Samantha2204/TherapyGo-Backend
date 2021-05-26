const ScheduleDB = require("../../../model/ScheduleModel");
const TherapistDB = require("../../../model/TherapistModel");
const RoomDB = require("../../../model/RoomModel");
const Customer = require("../../../model/CustomerModel");
const ServiceDB = require("../../../model/ServiceModel");
const TreatmentDB = require("../../../model/TreatmentModel");
const PaymentDB = require("../../../model/PaymentModel");
exports.index = async (ctx) => {
  try {
    await ScheduleDB.find({}, (err, users) => {
      ctx.body = users;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.store = async (ctx) => {
  const schedule = new ScheduleDB(ctx.request.body);
  try {
    await schedule.save();
    const msg = `${schedule._id} has been saved successfully`;
    ctx.status = 201;
    ctx.body = msg;
  } catch (e) {
    ctx.body = e;
  }
};
exports.delete = async (ctx) => {
  try {
    await ScheduleDB.findByIdAndRemove(ctx.params.id, () => {
      ctx.body = `Successfully delete schedule id: ${ctx.params.id}`;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.update = async (ctx) => {
  try {
    await ScheduleDB.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body,
      { rawResult: true },
      () => {
        ctx.body = `Successfully update schedule id: ${ctx.params.id}`;
      }
    );
  } catch (e) {
    ctx.body = e;
  }
};

exports.show = async (ctx) => {
  try {
    const res = await ScheduleDB.findById(ctx.params.id);
    ctx.body = res;
  } catch (e) {
    ctx.body = e;
  }
};

exports.findWorkSheetInformation = async (ctx) => {
  try {
    const date = ctx.params.date;
    const services = await ServiceDB.find({ date: date });
    let res = [];
    const todaySchedule = await ScheduleDB.find({ date: date });
    let todayStaffs = [];
    if (todaySchedule.length != 0) {
      const therapistList = todaySchedule[0].therapistId;
      for (i = 0; i < therapistList.length; i++) {
        const therapist = await TherapistDB.find({
          _id: therapistList[i],
          isAvailable: true,
        });
        if (therapist.length !== 0) {
          let temp = {
            firstName: therapist[0].firstName,
            color: therapist[0].colour,
            id: therapistList[i],
          };
          todayStaffs.push(temp);
        }
      }
    }
    for (i = 0; i < services.length; i++) {
      let serviceId = services[i]["_id"];
      let serviceTime = services[i]["time"];
      let status = services[i]["status"];
      let treatmentId = services[i]["treatmentId"];
      const treatmentModel = await TreatmentDB.find({ _id: treatmentId });
      const treatmentTime = treatmentModel[0]["treatmentDuration"];
      const treatmentType = treatmentModel[0]["treatmentStyle"];
      const treatmentBodyPart =
        treatmentModel[0]["treatmentBodyPart"] + "--" + treatmentTime + " min";
      const treatmentPrice = treatmentModel[0]["treatmentPrice"];
      const splitServiceTime = serviceTime.split(":");
      const StartTimeMin =
        Number(splitServiceTime[0]) * 60 + Number(splitServiceTime[1]);
      const TreatmentTimeMin = Number(treatmentTime);
      const endTime = StartTimeMin + TreatmentTimeMin;
      const hourTime = parseInt(endTime / 60);
      const minTime = endTime % 60;
      let endTImeString = "";
      if (minTime < 10 && hourTime < 10) {
        endTImeString = `0${hourTime}:0${minTime}`;
      } else if (minTime < 10 && hourTime >= 10) {
        endTImeString = `${hourTime}:0${minTime}`;
      } else if (minTime >= 10 && hourTime < 10) {
        endTImeString = `0${hourTime}:${minTime}`;
      } else {
        endTImeString = `${hourTime}:${minTime}`;
      }

      const customerId = services[i]["customerId"];
      const customerModel = await Customer.find({ _id: customerId });
      let customerFirstName = customerModel[0]["firstName"];
      let customerLastName = customerModel[0]["lastName"];
      let customerFullName = customerFirstName;
      let customerMobile = customerModel[0]["mobile"];
      const roomId = services[i]["roomId"];
      const roomModel = await RoomDB.find({ _id: roomId });
      let roomName = roomModel[0]["roomName"];
      let roomNumber = roomModel[0]["roomNumber"];
      const therapistId = services[i]["therapistId"];
      const therapistModel = await TherapistDB.find({ _id: therapistId });
      let therapistFirstName = therapistModel[0]["firstName"];
      let therapistLastName = therapistModel[0]["lastName"];
      let therapistFullName = therapistFirstName + therapistLastName;
      let startDate = date + "T" + serviceTime + ":00.000";
      let endDate = date + "T" + endTImeString + ":00.000";
      const paymentStatus = services[i]["paymentStatus"];
      let paymentMethod = "";
      let methodResult = [];
      if (paymentStatus == "Paid") {
        const paymentId = services[i]["paymentId"];
        const paymentModel = await PaymentDB.find({ _id: paymentId });
        paymentMethod = paymentModel[0].method;
        methodResult = paymentMethod.split("+");
      }
      let tem = {
        serviceId: serviceId,
        serviceTime: serviceTime,
        status: status,
        customerName: customerFullName,
        roomName: roomName,
        roomId: roomNumber,
        staffId: therapistId,
        therapistName: therapistFullName,
        startDate: startDate,
        endDate: endDate,
        serviceType: treatmentType,
        bodyParts: treatmentBodyPart,
        mobileNumber: customerMobile,
        paymentMethod: methodResult,
        treatmentPrice: treatmentPrice,
      };
      res.push(tem);
    }
    let finalRes = [];
    finalRes.push({ existAppointments: res }, { todayStaffs: todayStaffs });
    ctx.body = finalRes;
  } catch (e) {
    ctx.body = [];
  }
};

exports.findAllStaffs = async (ctx) => {
  try {
    const therapist = await TherapistDB.find({
      firstName: { $ne: "Unassigned" },
      isAvailable: true,
    });

    res = [];
    for (let index = 0; index < therapist.length; index++) {
      res.push({
        firstName: therapist[index]["firstName"],
        colour: therapist[index]["colour"],
      });
    }
    ctx.body = res;
  } catch (e) {
    ctx.body = e;
  }
};

exports.updateTodayStaffList = async (ctx) => {
  try {
    const { body } = ctx.request;
    const date = ctx.params.date;
    const staffList = body;
    let staffIdList = [];
    for (let index = 0; index < staffList.length; index++) {
      const staffName = staffList[index];
      const staff = await TherapistDB.find({ firstName: staffName });
      const staffId = staff[0]["_id"];
      staffIdList.push(staffId);
    }

    if ((await ScheduleDB.find({ date: date }).count()) > 0) {
      await ScheduleDB.updateOne(
        { date: date },
        { $set: { therapistId: staffIdList } }
      );
    } else {
      const schedule = new ScheduleDB({ therapistId: staffIdList, date: date });
      await schedule.save();
    }

    ctx.body = "update success";
  } catch (e) {
    ctx.body = e;
  }
};

exports.findWeekStaffList = async (ctx) => {
  try {
    const date = ctx.params.date;

    function getDates(date) {
      const currentDate = new Date(date);
      const timesStamp = currentDate.getTime();
      const currentDay = currentDate.getDay();
      let dates = [];
      for (let i = 0; i < 7; i++) {
        const dateISO = new Date(
          timesStamp + 24 * 60 * 60 * 1000 * (i - ((currentDay + 6) % 7))
        ).toISOString();
        const dateMy = dateISO.substring(0, 10);
        dates.push(dateMy);
      }
      return dates;
    }

    const week = getDates(date);

    result = [];
    for (let index = 0; index < week.length; index++) {
      let date = week[index];
      const res = await ScheduleDB.find({ date: date });
      let todayStaffs = [];
      if (res.length != 0) {
        const therapistList = res[0].therapistId;

        for (i = 0; i < therapistList.length; i++) {
          const therapist = await TherapistDB.find({
            _id: therapistList[i],
            isAvailable: true,
          });

          if (therapist.length !== 0) {
            let temp = therapist[0].firstName;
            todayStaffs.push(temp);
          }
        }
        let index = todayStaffs.indexOf("Unassigned");
        if (index > -1) {
          todayStaffs.splice(index, 1);
        }
      } else {
        todayStaffs = [];
      }
      result.push({ date: date, staffList: todayStaffs });
    }

    ctx.body = result;
  } catch (e) {
    ctx.body = e;
  }
};

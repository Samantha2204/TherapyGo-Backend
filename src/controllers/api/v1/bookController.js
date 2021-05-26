const Customer = require("../../../model/CustomerModel");
const PaymentDB = require("../../../model/PaymentModel");
const ServiceDB = require("../../../model/ServiceModel");
const TreatmentDB = require("../../../model/TreatmentModel");
const RoomDB = require("../../../model/RoomModel");
const TherapistDB = require("../../../model/TherapistModel");
const NotificationDB = require("../../../model/NotificationModel");
exports.staffAddService = async (ctx) => {
  const newServiceInfo = {};
  const { firstName, lastName, mobile, email } = ctx.request.body;
  try {
    const customerExists = await Customer.findOne({ mobile });
    if (customerExists) {
      newServiceInfo.customerId = customerExists._id;
    } else {
      try {
        const newCustomer = new Customer({
          firstName,
          lastName,
          mobile,
          email,
        });
        await newCustomer.save();
        newServiceInfo.customerId = newCustomer._id;
      } catch (error) {
        throw `save new customer error is: ---->> ${error}`;
      }
    }
  } catch (error) {
    throw `Finding customer error is: ${error}`;
  }
  if (lastName) {
    newServiceInfo.customerName = firstName + " " + lastName;
  } else {
    newServiceInfo.customerName = firstName;
  }
  newServiceInfo.customerMobile = mobile;

  const { bodyPartsAndDuration, treatmentStyle } = ctx.request.body;
  const parts = bodyPartsAndDuration.split("--");
  const treatmentBodyPart = parts[0];
  const treatmentDuration = parts[1].split(" ")[0];

  try {
    const treatment = await TreatmentDB.findOne({
      treatmentBodyPart,
      treatmentStyle,
      treatmentDuration,
    });
    if (treatment) {
      newServiceInfo.treatmentId = treatment._id;
    } else {
      throw `treatment don't exist or Input Wrong treatment (service name)`;
    }
  } catch (error) {
    throw `treatment error`;
  }

  const { date, time } = ctx.request.body;
  newServiceInfo.date = date;
  newServiceInfo.time = time;
  const hours = Math.floor(treatmentDuration / 60);
  const mins = treatmentDuration % 60;
  const startTimeHours = time.split(":")[0] * 1;
  const startTimeMins = time.split(":")[1] * 1;
  let endTimeHours = startTimeHours + hours;
  let endTimeMins = startTimeMins + mins;
  if (endTimeMins >= 60) {
    endTimeMins = Math.floor(endTimeMins % 60);
    endTimeHours = endTimeHours + 1;
  }
  endTimeHours = endTimeHours < 10 ? "0" + endTimeHours : endTimeHours;
  endTimeMins = endTimeMins < 10 ? "0" + endTimeMins : endTimeMins;
  newServiceInfo.endTime = endTimeHours + ":" + endTimeMins;

  const { therapistName } = ctx.request.body;
  try {
    const therapist = await TherapistDB.findOne({ firstName: therapistName });
    if (therapist) {
      newServiceInfo.therapistId = therapist._id;
      newServiceInfo.therapistName = therapistName;
    } else {
      throw `Therapist doesn't exit or inputting wrong name`;
    }
  } catch (error) {
    throw `Find therapist error ----> ${error}`;
  }

  const { roomName } = ctx.request.body;
  try {
    const isRoom = await RoomDB.findOne({ roomName });
    if (isRoom) {
      newServiceInfo.roomName = roomName;
      newServiceInfo.roomId = isRoom._id;
    } else {
      throw "Room doesn't exist or wrong room name";
    }
  } catch (error) {
    throw `room error: ${error}`;
  }

  const { paymentMethod, paymentAmount } = ctx.request.body;

  if (paymentMethod != undefined) {
    if (paymentMethod.length != 0) {
      const method = paymentMethod.join("+");
      newServiceInfo.paymentStatus = "Paid";
      ("4/14/2021");
      try {
        const newPayment = new PaymentDB({
          paymentDate: new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),

          paymentTime: new Date().toLocaleTimeString(),
          method,
          amount: paymentAmount,
          isPaid: true,
        });
        await newPayment.save();
        newServiceInfo.paymentId = newPayment._id;
      } catch (error) {
        throw `New payment error: ---> ${error}`;
      }
    } else {
      newServiceInfo.paymentStatus = "Unpaid";
      try {
        const newPayment = new PaymentDB({
          paymentDate: new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),

          paymentTime: new Date().toLocaleTimeString(),
          method: "",
          amount: paymentAmount,
          isPaid: true,
        });
        await newPayment.save();
        newServiceInfo.paymentId = newPayment._id;
      } catch (error) {
        throw `New payment error: ---> ${error}`;
      }
    }
  } else {
    newServiceInfo.paymentStatus = "Unpaid";
  }
  newServiceInfo.status = "Booked";
  try {
    const newService = await new ServiceDB(newServiceInfo);
    await newService.save();
    ctx.body = {
      code: 200,
      message: "Service saved!",
      serviceId: newService._id,
      status: newServiceInfo.status,
    };
  } catch (error) {
    throw `Save new service error: ---> ${error}`;
  }
};

exports.customerAddService = async (ctx) => {
  const newServiceInfo = {};
  const { firstName, lastName, mobile, email } = ctx.request.body;
  let customerEmail = "";
  try {
    const customerExists = await Customer.findOne({ mobile });
    if (customerExists) {
      newServiceInfo.customerId = customerExists._id;
      customerEmail = customerExists.email;
    } else {
      try {
        const newCustomer = new Customer({
          firstName,
          lastName,
          mobile,
          email,
        });
        await newCustomer.save();
        newServiceInfo.customerId = newCustomer._id;
      } catch (error) {
        throw `save new customer error is: ---->> ${error}`;
      }
    }
  } catch (error) {
    throw `Finding customer error is: ${error}`;
  }
  if (lastName) {
    newServiceInfo.customerName = firstName + " " + lastName;
  } else {
    newServiceInfo.customerName = firstName;
  }
  newServiceInfo.customerMobile = mobile;

  const { bodyPartsAndDuration, treatmentStyle } = ctx.request.body;
  const parts = bodyPartsAndDuration.split("--");
  const treatmentBodyPart = parts[0];
  const treatmentDuration = parts[1].split(" ")[0];
  try {
    const treatment = await TreatmentDB.findOne({
      treatmentBodyPart,
      treatmentStyle,
      treatmentDuration,
    });
    if (treatment) {
      newServiceInfo.treatmentId = treatment._id;
    } else {
      throw `treatment don't exist or Input Wrong treatment (service name)`;
    }
  } catch (error) {
    throw `treatment error`;
  }

  const { date, time } = ctx.request.body;
  newServiceInfo.date = date;
  newServiceInfo.time = time;
  const hours = Math.floor(treatmentDuration / 60);
  const mins = treatmentDuration % 60;
  const startTimeHours = time.split(":")[0] * 1;
  const startTimeMins = time.split(":")[1] * 1;
  let endTimeHours = startTimeHours + hours;
  let endTimeMins = startTimeMins + mins;
  if (endTimeMins >= 60) {
    endTimeMins = Math.floor(endTimeMins % 60);
    endTimeHours = endTimeHours + 1;
  }
  endTimeHours = endTimeHours < 10 ? "0" + endTimeHours : endTimeHours;
  endTimeMins = endTimeMins < 10 ? "0" + endTimeMins : endTimeMins;
  newServiceInfo.endTime = endTimeHours + ":" + endTimeMins;

  const { therapistName } = ctx.request.body;
  try {
    const therapist = await TherapistDB.findOne({ firstName: therapistName });
    if (therapist) {
      newServiceInfo.therapistId = therapist._id;
      newServiceInfo.therapistName = therapistName;
    } else {
      throw `Therapist doesn't exit or inputting wrong name`;
    }
  } catch (error) {
    throw `Find therapist error ----> ${error}`;
  }

  const { roomName } = ctx.request.body;

  try {
    const isRoom = await RoomDB.findOne({ roomName });
    if (isRoom) {
      newServiceInfo.roomName = roomName;
      newServiceInfo.roomId = isRoom._id;
    } else {
      throw "Room doesn't exist or wrong room name";
    }
  } catch (error) {
    throw `room error: ${error}`;
  }

  const { paymentMethod, paymentAmount } = ctx.request.body;
  if (paymentMethod != undefined) {
    if (paymentMethod.length != 0) {
      const method = paymentMethod.join("+");
      newServiceInfo.paymentStatus = "Paid";
      ("4/14/2021");
      try {
        const newPayment = new PaymentDB({
          paymentDate: new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),

          paymentTime: new Date().toLocaleTimeString(),
          method,
          amount: paymentAmount,
          isPaid: true,
        });
        await newPayment.save();
        newServiceInfo.paymentId = newPayment._id;
      } catch (error) {
        throw `New payment error: ---> ${error}`;
      }
    }
  } else {
    newServiceInfo.paymentStatus = "Unpaid";
    try {
      const newPayment = new PaymentDB({
        paymentDate: new Date().toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),

        paymentTime: new Date().toLocaleTimeString(),
        method: "",
        amount: paymentAmount,
        isPaid: true,
      });
      await newPayment.save();
      newServiceInfo.paymentId = newPayment._id;
    } catch (error) {
      throw `New payment error: ---> ${error}`;
    }
  }
  newServiceInfo.status = "Booked";

  try {
    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const currentTime = new Date().toLocaleTimeString();
    const d = new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    const newNotification = await new NotificationDB({
      image:
        "https://www.pikpng.com/pngl/m/320-3203375_checked-icon-clipart.png",
      message: `${newServiceInfo.customerName} booked an appointment at ${newServiceInfo.time} on ${d} .`,
      receivedTime: `${currentDate} ${currentTime}`,
      new: true,
    });
    await newNotification.save();
  } catch (error) {
    throw `Save notification error: ---> ${error}`;
  }

  try {
    const newService = await new ServiceDB(newServiceInfo);
    await newService.save();
    ctx.body = {
      code: 200,
      email: customerEmail,
      message: "Service saved!",
      serviceId: newService._id,
      status: newServiceInfo.status,
    };
  } catch (error) {
    throw `Save new service error: ---> ${error}`;
  }
};

exports.start = async (ctx) => {
  const { id } = ctx.request.body;
  if (id) {
    const service = await ServiceDB.findById(id);
    if (service) {
      service.status = "Ongoing";
      ctx.body = {
        code: 200,
        message: "Service start",
        status: service.status,
      };
    }
  } else {
    const newServiceInfo = {};
    const { firstName, lastName, mobile, email } = ctx.request.body;
    try {
      const customerExists = await Customer.findOne({
        $or: [{ mobile }, { email }],
      });
      if (customerExists) {
        newServiceInfo.customerId = customerExists._id;
      } else {
        try {
          const newCustomer = new Customer({
            firstName,
            lastName,
            mobile,
            email,
          });
          await newCustomer.save();
          newServiceInfo.customerId = newCustomer._id;
        } catch (error) {
          throw `save new customer error is: ---->> ${error}`;
        }
      }
    } catch (error) {
      throw `Finding customer error is: ${error}`;
    }
    if (lastName) {
      newServiceInfo.customerName = firstName + " " + lastName;
    } else {
      newServiceInfo.customerName = firstName;
    }
    newServiceInfo.customerMobile = mobile;

    const {
      treatmentBodyPart,
      treatmentStyle,
      treatmentDuration,
    } = ctx.request.body;
    try {
      const treatment = await TreatmentDB.findOne({
        treatmentBodyPart,
        treatmentStyle,
        treatmentDuration,
      });
      if (treatment) {
        newServiceInfo.treatmentId = treatment._id;
      } else {
        throw `treatment don't exist or Input Wrong treatment (service name)`;
      }
    } catch (error) {
      throw `treatment error----${error}`;
    }

    const { date, time } = ctx.request.body;
    newServiceInfo.date = date;
    newServiceInfo.time = time;
    const hours = Math.floor(treatmentDuration / 60);
    const mins = treatmentDuration % 60;
    const startTimeHours = time.split(":")[0] * 1;
    const startTimeMins = time.split(":")[1] * 1;
    let endTimeHours = startTimeHours + hours;
    let endTimeMins = startTimeMins + mins;
    if (endTimeMins >= 60) {
      endTimeMins = Math.floor(endTimeMins % 60);
      endTimeHours = endTimeHours + 1;
    }
    endTimeHours = endTimeHours < 10 ? "0" + endTimeHours : endTimeHours;
    endTimeMins = endTimeMins < 10 ? "0" + endTimeMins : endTimeMins;
    newServiceInfo.endTime = endTimeHours + ":" + endTimeMins;
    const { therapistName } = ctx.request.body;
    try {
      const therapist = await TherapistDB.findOne({ firstName: therapistName });
      if (therapist) {
        newServiceInfo.therapistId = therapist._id;
        newServiceInfo.therapistName = therapistName;
      } else {
        throw `Therapist doesn't exit or inputting wrong name`;
      }
    } catch (error) {
      throw `Find therapist error ----> ${error}`;
    }

    const { room } = ctx.request.body;
    try {
      const isRoom = await RoomDB.findOne({ roomName: room });
      if (isRoom) {
        newServiceInfo.roomName = room;
        newServiceInfo.roomId = isRoom._id;
      } else {
        throw "Room doesn't exist or wrong room name";
      }
    } catch (error) {
      throw `room error: ${error}`;
    }

    const {
      paymentDate,
      paymentTime,
      paymentMethod,
      paymentAmount,
    } = ctx.request.body;
    if (paymentMethod) {
      newServiceInfo.paymentStatus = "Paid";
      try {
        const newPayment = new PaymentDB({
          paymentDate,
          paymentTime,
          method: paymentMethod,
          amount: paymentAmount,
          status: "Paid",
        });
        await newPayment.save();
        newServiceInfo.paymentId = newPayment._id;
      } catch (error) {
        throw `New payment error: ---> ${error}`;
      }
    } else {
      newServiceInfo.paymentStatus = "Unpaid";
    }
    newServiceInfo.status = "Ongoing";
    clearTimeout;
    setTimeout(() => {
      newServiceInfo.status = "Finished";
    }, treatmentDuration * 60 * 1000);

    try {
      const newService = await new ServiceDB(newServiceInfo);
      await newService.save();
      ctx.body = {
        code: 200,
        message: "Service saved!",
        serviceId: newService._id,
        status: newServiceInfo.status,
      };
    } catch (error) {
      throw `Save new service error: ---> ${error}`;
    }
  }
};

exports.update = async (ctx) => {
  const { body } = ctx.request;
  const serviceId = ctx.params.id;
  const {
    time,
    bodyPartsAndDuration,
    therapistName,
    firstName,
    mobile,
    roomName,
    paymentMethod,
    paymentAmount,
  } = body;

  const parts = bodyPartsAndDuration.split("--");
  const treatmentBodyPart = parts[0];
  const treatmentDuration = parts[1].split(" ")[0];

  const hours = Math.floor(treatmentDuration / 60);
  const mins = treatmentDuration % 60;
  const startTimeHours = time.split(":")[0] * 1;
  const startTimeMins = time.split(":")[1] * 1;
  let endTimeHours = startTimeHours + hours;
  let endTimeMins = startTimeMins + mins;
  if (endTimeMins >= 60) {
    endTimeMins = Math.floor(endTimeMins % 60);
    endTimeHours = endTimeHours + 1;
  }
  endTimeHours = endTimeHours < 10 ? "0" + endTimeHours : endTimeHours;
  endTimeMins = endTimeMins < 10 ? "0" + endTimeMins : endTimeMins;
  const endTime = endTimeHours + ":" + endTimeMins;

  try {
    try {
      const date = body["date"];
      const time = body["time"];
      await ServiceDB.updateOne(
        { _id: serviceId },
        {
          $set: {
            time: time,
            date: date,
            endTime,
            customerName: firstName,
            customerMobile: mobile,
            therapistName,
            roomName: roomName,
          },
        }
      );
    } catch (error) {
      throw `find service and update date or time ERROR:----> ${error}`;
    }

    try {
      const room = await RoomDB.find({ roomName: roomName });
      const roomId = room[0]["_id"];
      await ServiceDB.updateOne(
        { _id: serviceId },
        { $set: { roomId: roomId } }
      );
    } catch (error) {
      throw `find service and update room ERROR:----> ${error}`;
    }

    try {
      const therapistFirstname = body["therapistName"];
      const therapist = await TherapistDB.find({
        firstName: therapistFirstname,
      });
      const therapistId = therapist[0]["_id"];
      await ServiceDB.updateOne(
        { _id: serviceId },
        { $set: { therapistId: therapistId } }
      );
    } catch (error) {
      throw `find service and update therapistId ERROR:----> ${error}`;
    }

    try {
      const treatmentStyle = body["treatmentStyle"];
      const treatment = await TreatmentDB.find({
        treatmentDuration,
        treatmentStyle,
        treatmentBodyPart,
      });
      const treatmentId = treatment[0]["_id"];
      await ServiceDB.updateOne(
        { _id: serviceId },
        { $set: { treatmentId: treatmentId } }
      );
    } catch (error) {
      throw `find service and update treatmentId ERROR:----> ${error}`;
    }

    try {
      const service = await ServiceDB.find({ _id: serviceId });
      const customerId = service[0]["customerId"];
      customerKeylist = ["firstName", "lastName", "mobile", "email"];
      let customerInput = {};
      for (let index = 0; index < customerKeylist.length; index++) {
        const element = customerKeylist[index];
        if (body.hasOwnProperty(element)) {
          customerInput[element] = body[element];
        }
      }
      await Customer.updateOne({ _id: customerId }, { $set: customerInput });
    } catch (error) {
      throw `find customer and update ERROR:----> ${error}`;
    }

    try {
      const service = await ServiceDB.find({ _id: serviceId });
      const paymentId = service[0]["paymentId"];
      let paymentKeylist = ["paymentMethod", "paymentAmount"];
      let paymentInput = {};

      for (let index = 0; index < paymentKeylist.length; index++) {
        const element = paymentKeylist[index];
        if (body.hasOwnProperty(element)) {
          paymentInput[element] = body[element];
        }
      }

      if (
        paymentInput.hasOwnProperty("paymentMethod") &&
        paymentInput.hasOwnProperty("paymentAmount")
      ) {
        paymentInput["isPaid"] = "Paid";
      } else {
        paymentInput["isPaid"] = "Unpaid";
      }
      try {
        await ServiceDB.updateOne(
          { _id: serviceId },
          { $set: { paymentStatus: paymentInput.isPaid } }
        );
      } catch (error) {
        throw `Update service paymentStatus error----> ${error}`;
      }
      const method = paymentMethod.join("+");
      await PaymentDB.updateOne(
        { _id: paymentId },
        {
          $set: {
            paymentDate: new Date().toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            }),
            paymentTime: new Date().toLocaleTimeString(),
            method,
            amount: paymentAmount,
          },
        }
      );
    } catch (error) {
      throw `find payment and update ERROR:----> ${error}`;
    }

    ctx.body = "update success";
  } catch (e) {
    ctx.body = e;
    throw e;
  }
};

exports.staffDeleteService = async (ctx) => {
  const { id } = ctx.params;
  try {
    const serviceToBeDeleted = await ServiceDB.findById(id);
    if (serviceToBeDeleted) {
      const { paymentId } = serviceToBeDeleted;
      if (paymentId) {
        try {
          await PaymentDB.findByIdAndRemove(paymentId);
        } catch (error) {
          throw new Error(`Delete payment by id Error---->${error}`);
        }
      }
      try {
        const serviceRemoved = await ServiceDB.findByIdAndRemove(id);
        if (serviceRemoved) {
          ctx.body = {
            code: 202,
            message: "service deleted!",
            id: id,
          };
        }
      } catch (error) {
        throw new Error(`delete service by id error---->${error}`);
      }
    } else {
      ctx.body = {
        code: 404,
        message: `cannot found this service by id: ${id}`,
        id,
      };
    }
  } catch (error) {
    throw new Error(`find delete service id Error---->${error}`);
  }
};

exports.customerDeleteService = async (ctx) => {
  const { id } = ctx.params;
  try {
    const serviceToBeDeleted = await ServiceDB.findById(id);
    if (serviceToBeDeleted) {
      const { paymentId } = serviceToBeDeleted;
      if (paymentId) {
        try {
          await PaymentDB.findByIdAndRemove(paymentId);
        } catch (error) {
          throw new Error(`Delete payment by id Error---->${error}`);
        }
      }
      try {
        const serviceRemoved = await ServiceDB.findByIdAndRemove(id);
        if (serviceRemoved) {
          try {
            const currentDate = new Date().toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            });
            const currentTime = new Date().toLocaleTimeString();
            const newNotification = await new NotificationDB({
              image: "https://www.pngkin.com/mnp/7-75996.png",
              message: `${
                serviceRemoved.customerName
              } cancelled an appointment at ${
                serviceRemoved.time
              } on ${serviceRemoved.date.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}.`,
              receivedTime: `${currentDate} ${currentTime}`,
              new: true,
            });
            await newNotification.save();
          } catch (error) {
            throw `Save delete notification error: ---> ${error}`;
          }
          ctx.body = {
            code: 202,
            message: "service deleted!",
            id: id,
          };
        }
      } catch (error) {
        throw new Error(`delete service by id error---->${error}`);
      }
    } else {
      ctx.body = {
        code: 404,
        message: `cannot found this service by id: ${id}`,
        id,
      };
    }
  } catch (error) {
    throw new Error(`find delete service id Error---->${error}`);
  }
};
exports.getNotifications = async (ctx) => {
  try {
    const notifications = await NotificationDB.find();
    ctx.body = notifications;
  } catch (error) {
    throw error;
  }
};
exports.updateNotification = async (ctx) => {
  try {
    const { body } = ctx.request;
    await NotificationDB.updateMany({}, { $set: { new: body.new } });
    ctx.body = "update success";
  } catch (error) {
    throw error;
  }
};

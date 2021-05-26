const ServiceDB = require("../../../model/ServiceModel");
const ScheduleDB = require("../../../model/ScheduleModel");
const TherapistDB = require("../../../model/TherapistModel");
const RoomDB = require("../../../model/RoomModel");
const TreatmentDB = require("../../../model/TreatmentModel");

const timeToMinutes = (time) => {
  const timeParts = time.split(":");
  const hours = timeParts[0];
  const mins = timeParts[1] * 1;
  const minutes = hours * 60 + mins;
  return minutes;
};

exports.findTherapistWithTimeAndDate = async (ctx) => {
  const { date, time } = ctx.params;
  const newAppointmentStartPoint = timeToMinutes(time);
  try {
    let unavailableTherapistList = [];
    const allServicesOfDate = await ServiceDB.find({ date });
    if (allServicesOfDate) {
      allServicesOfDate.forEach((service) => {
        const existedAppointmentStartPoint = timeToMinutes(service.time);
        const existedAppointmentEndPoint = timeToMinutes(service.endTime);
        if (
          existedAppointmentStartPoint <= newAppointmentStartPoint &&
          existedAppointmentEndPoint > newAppointmentStartPoint
        ) {
          unavailableTherapistList.push(service.therapistName);
        }
        if (existedAppointmentStartPoint > newAppointmentStartPoint) {
          const mins = existedAppointmentStartPoint - newAppointmentStartPoint;
          if (mins < 20) {
            unavailableTherapistList.push(service.therapistName);
          }
        }
      });
    }
    try {
      const workingTherapists = await ScheduleDB.findOne({ date }).populate(
        "therapistId",
        "firstName"
      );
      const availableTherapists = [];
      if (workingTherapists) {
        workingTherapists.therapistId.map((therapist) => {
          const result = unavailableTherapistList.includes(therapist.firstName);
          if (!result) {
            availableTherapists.push(therapist);
          }
        });
      }
      if (availableTherapists.length > 0) {
        for (let index = 0; index < availableTherapists.length; index++) {
          const finalTherapist = availableTherapists[index];
          const id = finalTherapist._id;
          const deletedTherapist = await TherapistDB.find({
            _id: id,
            isAvailable: false,
          });
          if (deletedTherapist.length !== 0) {
            availableTherapists.splice(index, 1);
          }
        }

        ctx.body = {
          therapistList: availableTherapists,
          code: 200,
        };
      } else {
        ctx.body = {
          therapistList:
            "No available therapist on this treatment. Please choose shorter duration one.",
          message:
            "No available therapist on this treatment. Please choose shorter duration one.",
          code: 404,
        };
      }
    } catch (error) {
      throw `find working therapist error: ----> ${error}`;
    }
  } catch (error) {
    throw `Finding Service ERROR: ${error}`;
  }
};

exports.findTherapists = async (ctx) => {
  const { date, time, treatmentDuration } = ctx.params;
  const newAppointmentStartPoint = timeToMinutes(time);
  const newAppointmentEndPoint =
    newAppointmentStartPoint + treatmentDuration * 1;
  try {
    const allServicesOfDate = await ServiceDB.find({ date });
    let unavailableTherapistList = [];
    if (allServicesOfDate) {
      allServicesOfDate.forEach((service) => {
        const existedAppointmentStartPoint = timeToMinutes(service.time);
        const existedAppointmentEndPoint = timeToMinutes(service.endTime);
        if (
          existedAppointmentStartPoint <= newAppointmentStartPoint &&
          existedAppointmentEndPoint > newAppointmentStartPoint
        ) {
          unavailableTherapistList.push(service.therapistName);
        }
        if (
          existedAppointmentEndPoint >= newAppointmentEndPoint &&
          existedAppointmentStartPoint < newAppointmentEndPoint
        ) {
          unavailableTherapistList.push(service.therapistName);
        }
        if (
          existedAppointmentStartPoint >= newAppointmentStartPoint &&
          existedAppointmentStartPoint < newAppointmentEndPoint
        ) {
          unavailableTherapistList.push(service.therapistName);
        }
        if (
          existedAppointmentEndPoint > newAppointmentStartPoint &&
          existedAppointmentEndPoint <= newAppointmentEndPoint
        ) {
          unavailableTherapistList.push(service.therapistName);
        }
      });
      unavailableTherapistList = new Set(unavailableTherapistList);
      unavailableTherapistList = [...unavailableTherapistList];
    }
    try {
      const workingTherapists = await ScheduleDB.findOne({ date }).populate(
        "therapistId",
        "firstName"
      );
      const availableTherapists = [];
      if (workingTherapists) {
        workingTherapists.therapistId.map((therapist) => {
          const result = unavailableTherapistList.includes(therapist.firstName);
          if (!result) {
            availableTherapists.push(therapist);
          }
        });
      }
      if (availableTherapists.length > 0) {
        for (let index = 0; index < availableTherapists.length; index++) {
          const finalTherapist = availableTherapists[index];
          const id = finalTherapist._id;
          const deletedTherapist = await TherapistDB.find({
            _id: id,
            isAvailable: false,
          });
          if (deletedTherapist.length !== 0) {
            availableTherapists.splice(index, 1);
          }
        }

        ctx.body = {
          therapistList: availableTherapists,
          code: 200,
        };
      } else {
        ctx.body = {
          therapistList:
            "No available therapist on this treatment. Please choose shorter duration one.",
          message:
            "No available therapist on this treatment. Please choose shorter duration one.",
          code: 404,
        };
      }
    } catch (error) {
      throw `find working therapist error: ----> ${error}`;
    }
  } catch (error) {
    throw `Finding all services error----->> ${error}`;
  }
};

exports.findTreatmentsWithRoomName = async (ctx) => {
  const { date, time, roomName } = ctx.params;
  const startMinutes = timeToMinutes(time);
  try {
    const allServicesInThisRoomTheDay = await ServiceDB.find({
      date,
      roomName,
    });
    if (allServicesInThisRoomTheDay) {
      const startTimeList = [];
      let message = "";
      allServicesInThisRoomTheDay.forEach((service) => {
        const startPoint = timeToMinutes(service.time);
        const endPoint = timeToMinutes(service.endTime);
        if (endPoint > startMinutes && startPoint <= startMinutes) {
          const mins = endPoint - startMinutes;
          message = `This room is unavailable now, Please waiting for ${mins} minutes or choose other room.`;
          startTimeList.push(message);
        }
        if (startPoint > startMinutes) {
          startTimeList.push(startPoint);
        }
      });
      if (startTimeList.includes(message)) {
        ctx.body = {
          code: 404,
          message,
        };
      } else {
        const latestServiceStartTime = Math.min(...startTimeList);
        const longestTreatmentDuration = latestServiceStartTime - startMinutes;
        try {
          const treatmentList = await TreatmentDB.find({
            treatmentDuration: { $lte: longestTreatmentDuration },
            treatmentStyle: "Dry",
          });
          const availableTreatmentList = [];
          if (treatmentList) {
            treatmentList.map((treatment) => {
              const item =
                treatment.treatmentBodyPart +
                "--" +
                treatment.treatmentDuration +
                " min";
              availableTreatmentList.push(item);
            });
          } else {
            throw `Can't found treatment list`;
          }
          ctx.body = {
            availableTreatmentList,
            code: 200,
          };
        } catch (error) {
          throw `2. Find treatment error:-----> ${error}`;
        }
      }
    }
  } catch (error) {
    throw `Find allServicesInThisRoomTheDay error:-----> ${error}`;
  }
};

exports.findTreatments = async (ctx) => {
  const { date, time, roomName, therapistName } = ctx.params;
  const startMinutes = timeToMinutes(time);
  try {
    const allServicesOfTherapistOnDate = await ServiceDB.find({
      date,
      therapistName,
    });
    try {
      const allServicesInThisRoomTheDay = await ServiceDB.find({
        date,
        roomName,
      });
      let allServicesOfTherapistAndRoom = allServicesOfTherapistOnDate.concat(
        allServicesInThisRoomTheDay
      );
      allServicesOfTherapistAndRoom = new Set(allServicesOfTherapistAndRoom);
      allServicesOfTherapistAndRoom = [...allServicesOfTherapistAndRoom];
      if (allServicesOfTherapistAndRoom) {
        let message = "";
        const startTimeList = [];
        allServicesOfTherapistAndRoom.forEach((service) => {
          const startPoint = timeToMinutes(service.time);
          const endPoint = timeToMinutes(service.endTime);
          if (endPoint > startMinutes && startPoint <= startMinutes) {
            const mins = endPoint - startMinutes;
            message = `This therapist is Working now, Please waiting ${mins} minutes or choose other therapist.`;
            startTimeList.push(message);
          }
          if (startPoint > startMinutes) {
            startTimeList.push(startPoint);
          }
        });
        if (startTimeList.includes(message)) {
          ctx.body = {
            code: 404,
            message,
          };
        } else {
          const latestServiceStartTime = Math.min(...startTimeList);
          const longestTreatmentDuration =
            latestServiceStartTime - startMinutes;
          try {
            const treatmentList = await TreatmentDB.find({
              treatmentDuration: { $lte: longestTreatmentDuration },
              treatmentStyle: "Dry",
            });
            const availableTreatmentList = [];
            if (treatmentList) {
              treatmentList.map((treatment) => {
                const item =
                  treatment.treatmentBodyPart +
                  "--" +
                  treatment.treatmentDuration +
                  " min";
                availableTreatmentList.push(item);
              });
            } else {
              throw `Can't found treatment list`;
            }
            ctx.body = {
              availableTreatmentList,
              code: 200,
            };
          } catch (error) {
            throw `Find treatment error:-----> ${error}`;
          }
        }
      }
    } catch (error) {
      throw `Finding all services of this room on the day ERROR----> ${error}`;
    }
  } catch (error) {
    throw `Finding all services of the therapist on the day ERROR----->> ${error}`;
  }
};

exports.findDefaultPrice = async (ctx) => {
  try {
    const {
      treatmentDuration,
      treatmentStyle,
      treatmentBodyPart,
    } = ctx.request.body;
    const treatment = await TreatmentDB.findOne({
      treatmentDuration,
      treatmentStyle,
      treatmentBodyPart,
    });
    const defaultPrice = treatment.treatmentPrice;
    ctx.body = defaultPrice;
  } catch (e) {
    ctx.body = e;
    throw e;
  }
};

exports.checkAvailableAppointment = async (ctx) => {
  let totalRoomNum = 0;
  let rooms = null;
  try {
    rooms = await RoomDB.find();

    totalRoomNum = rooms.length;
  } catch (error) {
    throw `3.finding room error-------${error}`;
  }

  let availableTimeList = {};

  for (let start = 8; start < 22; start++) {
    let key = null;
    if (start < 9) {
      key = `0${start}:00-0${start + 1}:00`;
    } else if (9 <= start && start < 10) {
      key = `0${start}:00-${start + 1}:00`;
    } else if (start >= 10) {
      key = `${start}:00-${start + 1}:00`;
    }
    availableTimeList[key] = totalRoomNum;
  }

  const { date } = ctx.params;
  try {
    const servicesOfDate = await ServiceDB.find({ date });
    if (servicesOfDate === null) {
      ctx.body = availableTimeList;
      return;
    }

    if (servicesOfDate === undefined) {
      throw `2.Finding services of date ERROR----${error}`;
    }

    if (servicesOfDate) {
      let hours = [];
      rooms.forEach((room) => {
        let hoursOfRoom = [];
        const { roomName } = room;
        const servicesOfRoom = servicesOfDate.filter(
          (service) => service.roomName === roomName
        );
        servicesOfRoom.forEach((service) => {
          if (service.endTime.split(":")[1] == 0) {
            hoursOfRoom.push(parseInt(service.time.split(":")[0]));
          } else {
            hoursOfRoom.push(parseInt(service.time.split(":")[0]));
            hoursOfRoom.push(parseInt(service.endTime.split(":")[0]));
          }
        });
        hoursOfRoom = new Set(hoursOfRoom);
        hoursOfRoom = [...hoursOfRoom];
        hours = [...hours, ...hoursOfRoom];
      });

      let calculator = {};
      hours.forEach((hour) => {
        let key = "";
        if (hour < 9) {
          key = `0${hour}:00-0${hour + 1}:00`;
        } else if (9 <= hour && hour < 10) {
          key = `0${hour}:00-${hour + 1}:00`;
        } else if (hour >= 10) {
          key = `${hour}:00-${hour + 1}:00`;
        }
        calculator[key] = calculator[key] + 1 || 1;
      });

      for (const key in calculator) {
        if (availableTimeList.hasOwnProperty(key)) {
          if (availableTimeList[key] <= calculator[key]) {
            delete availableTimeList[key];
          }
          availableTimeList[key] -= calculator[key];
        }
      }
      ctx.body = availableTimeList;
    }
  } catch (error) {
    throw `1.finding service error----${error}`;
  }
};

exports.checkAvailableRooms = async (ctx) => {
  const { date, time, duration } = ctx.params;
  const startTimeMins = timeToMinutes(time);
  const endTimeMins = startTimeMins + parseInt(duration);

  let rooms = null;
  try {
    rooms = await RoomDB.find();
  } catch (error) {
    throw `Finding rooms Error: ----> ${error}`;
  }

  let appointments = [];
  try {
    appointments = await ServiceDB.find({ date });
  } catch (error) {
    throw `Finding appointments ERROR =====>>> ${error}`;
  }

  let availableRooms = [];
  rooms.map((room) => {
    const { roomName } = room;
    const appointmentsOfRoom = appointments.filter(
      (item) => item.roomName === roomName
    );

    const result = appointmentsOfRoom.map((appointment) => {
      const { time, endTime } = appointment;
      const existedStartTime = timeToMinutes(time);
      const existedEndTime = timeToMinutes(endTime);
      if (existedStartTime >= endTimeMins || existedEndTime <= startTimeMins) {
        return true;
      } else {
        return false;
      }
    });

    if (!result.includes(false)) {
      availableRooms.push(roomName);
    }
  });
  if (availableRooms.length > 0) {
    ctx.body = {
      availableRooms,
      code: 200,
    };
  }
  if (availableRooms.length <= 0) {
    ctx.body = {
      message: "No available room.",
      code: 404,
    };
  }
};

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
  const { date, time, id } = ctx.params;
  const newAppointmentStartPoint = timeToMinutes(time);
  try {
    let unavailableTherapistList = [];
    let allServicesOfDate = await ServiceDB.find({ date });

    if (allServicesOfDate) {
      allServicesOfDate = allServicesOfDate.filter((item) => item._id !== id);
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
  const { date, time, treatmentDuration, id } = ctx.params;
  const newAppointmentStartPoint = timeToMinutes(time);
  const newAppointmentEndPoint =
    newAppointmentStartPoint + treatmentDuration * 1;
  try {
    let allServicesOfDate = await ServiceDB.find({ date });
    let unavailableTherapistList = [];
    if (allServicesOfDate) {
      allServicesOfDate = allServicesOfDate.filter((item) => item._id !== id);
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
  const { date, time, roomName, id } = ctx.params;
  const startMinutes = timeToMinutes(time);
  try {
    let allServicesInThisRoomTheDay = await ServiceDB.find({ date, roomName });
    if (allServicesInThisRoomTheDay) {
      allServicesInThisRoomTheDay = allServicesInThisRoomTheDay.filter(
        (item) => item._id != id
      );
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
  const { date, time, roomName, therapistName, id } = ctx.params;
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
      allServicesOfTherapistAndRoom = allServicesOfTherapistAndRoom.filter(
        (item) => item._id !== id
      );
      allServicesOfTherapistAndRoom = new Set(allServicesOfTherapistAndRoom);
      allServicesOfTherapistAndRoom = [...allServicesOfTherapistAndRoom];
      if (allServicesOfTherapistAndRoom) {
        let message = "";
        const startTimeList = [];
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

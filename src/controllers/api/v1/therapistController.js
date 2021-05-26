const TherapistDB = require("../../../model/TherapistModel");
const SalaryDetailDB = require("../../../model/SalaryDetailModel");
const ServiceDB = require("../../../model/ServiceModel");

exports.index = async (ctx) => {
  try {
    await TherapistDB.find({}, (err, users) => {
      ctx.body = users;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.store = async (ctx) => {
  const therapist = new TherapistDB(ctx.request.body);
  try {
    await therapist.save();
    const msg = `${therapist._id} has been saved successfully`;
    ctx.status = 201;
    ctx.body = msg;
  } catch (e) {
    ctx.body = e;
  }
};

exports.delete = async (ctx) => {
  try {
    const id = ctx.params.id;
    let information = "";
    let number = 0;
    let myDate = new Date();
    myDate.toLocaleDateString();
    const relatedService = await ServiceDB.find({
      therapistId: id,
      date: { $gte: myDate },
    });
    if (relatedService.length !== 0) {
      information = "This therapist has some service to do. Delete fail.";
      number = 201;
    } else {
      await TherapistDB.updateOne(
        { _id: id },
        { $set: { isAvailable: false } }
      );
      information = "delete success";
      number = 200;
    }
    ctx.body = information;
    ctx.status = number;
  } catch (e) {
    ctx.body = e;
  }
};

exports.update = async (ctx) => {
  try {
    await TherapistDB.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body,
      { rawResult: true },
      () => {
        ctx.body = `Successfully update therapist id: ${ctx.params.id}`;
      }
    );
  } catch (e) {
    ctx.body = e;
  }
};

exports.show = async (ctx) => {
  try {
    await TherapistDB.findById(ctx.params.id, (err, therapist) => {
      ctx.body = therapist;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.addStaff = async (ctx) => {
  try {
    let therapist = ctx.request.body;
    const salary = therapist.salary;
    weeklyAmount = { weeklyAmount: salary };
    const newSalary = new SalaryDetailDB(weeklyAmount);
    await newSalary.save();
    const salaryID = newSalary._id;
    delete therapist.salary;
    therapist["salaryId"] = salaryID;
    const newTherapist = new TherapistDB(therapist);
    await newTherapist.save();
    const msg = `${newTherapist._id} has been saved successfully`;
    ctx.status = 201;
    ctx.body = msg;
  } catch (e) {
    ctx.body = e;
  }
};

exports.getStaff = async (ctx) => {
  try {
    const staffs = await TherapistDB.find();
    const newStaffs = [];
    for (let index = 0; index < staffs.length; index++) {
      const staff = staffs[index];
      const salaryId = staff.salaryId;

      const salaryDetail = await SalaryDetailDB.findOne(salaryId);

      const id = staff._id;
      const salary = salaryDetail.weeklyAmount;
      const firstName = staff.firstName;
      const certificated = staff.isCertificated;
      const available = staff.isAvailable;
      const colour = staff.colour;
      const email = staff.email;
      const tfn = staff.tfn;
      let superNumber = "";
      if (staff.superNumber) {
        superNumber = staff.superNumber;
      }
      let mobile = "";
      if (staff.mobile) {
        mobile = staff.mobile;
      }
      const newStaff = {
        id: id,
        salary: salary,
        firstName: firstName,
        certificated: certificated,
        available: available,
        colour: colour,
        email: email,
        tfn: tfn,
        mobile: mobile,
        superNumber: superNumber,
      };
      if (available === true) {
        newStaffs.push(newStaff);
      }
    }
    ctx.body = newStaffs;
  } catch (e) {
    ctx.body = e;
  }
};

exports.updateStaff = async (ctx) => {
  try {
    const staff = ctx.request.body;
    const staffId = ctx.params.id;
    const therapist = await TherapistDB.findOne({ _id: staffId });
    const salaryId = therapist.salaryId;
    const salary = staff.salary;
    await SalaryDetailDB.updateOne(
      { _id: salaryId },
      { $set: { weeklyAmount: salary } }
    );
    delete staff.salary;
    staff.salaryId = salaryId;
    await TherapistDB.updateOne({ _id: staffId }, { $set: staff });
    ctx.body = "update success";
    ctx.status = 200;
  } catch (e) {
    ctx.body = e;
  }
};

exports.getOneStaff = async (ctx) => {
  try {
    const staffId = ctx.params.id;
    const staff = await TherapistDB.findOne({ _id: staffId });
    const salaryId = staff.salaryId;
    const salaryDetail = await SalaryDetailDB.findOne({ _id: salaryId });

    const salary = salaryDetail.weeklyAmount;
    const firstName = staff.firstName;
    const certificated = staff.isCertificated;
    const available = staff.isAvailable;
    const colour = staff.colour;
    const email = staff.email;
    const tfn = staff.tfn;
    let superNumber = "";
    if (staff.superNumber) {
      superNumber = staff.superNumber;
    }
    let mobile = "";
    if (staff.mobile) {
      mobile = staff.mobile;
    }
    const newStaff = {
      salary: salary,
      firstName: firstName,
      certificated: certificated,
      available: available,
      colour: colour,
      email: email,
      tfn: tfn,
      mobile: mobile,
      superNumber: superNumber,
    };
    ctx.body = newStaff;
  } catch (e) {
    ctx.body = e;
  }
};

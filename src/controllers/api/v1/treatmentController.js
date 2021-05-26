const TreatmentDB = require("../../../model/TreatmentModel");

exports.index = async (ctx) => {
  try {
    await TreatmentDB.find({}, (err, users) => {
      ctx.body = users;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.store = async (ctx) => {
  const treatment = new TreatmentDB(ctx.request.body);
  try {
    await treatment.save();
    const msg = `${treatment._id} has been saved successfully`;
    ctx.status = 201;
    ctx.body = msg;
  } catch (e) {
    ctx.body = e;
  }
};
exports.delete = async (ctx) => {
  try {
    await TreatmentDB.findByIdAndRemove(ctx.params.id, () => {
      ctx.body = `Successfully delete treatment id: ${ctx.params.id}`;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.update = async (ctx) => {
  try {
    await TreatmentDB.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body,
      { rawResult: true },
      () => {
        ctx.body = `Successfully update treatment id: ${ctx.params.id}`;
      }
    );
  } catch (e) {
    ctx.body = e;
  }
};
exports.show = async (ctx) => {
  try {
    await TreatmentDB.findById(ctx.params.id, (err, treatment) => {
      ctx.body = treatment;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.getAllTreatments = async (ctx) => {
  try {
    const treatments = await TreatmentDB.find({});
    let result = [];
    for (i = 0; i < treatments.length; i++) {
      const treatmentsName = treatments[i].treatmentBodyPart;
      const treatmentPackage = treatments[i].treatmentPackage;
      let tem = {
        treatment: treatmentsName,
        treatmentPackage: treatmentPackage,
      };
      result.push(tem);
    }
    ctx.body = result;
  } catch (e) {
    ctx.body = e;
  }
};

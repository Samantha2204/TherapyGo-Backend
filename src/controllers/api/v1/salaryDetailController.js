const SalaryDetailDB = require('../../../model/SalaryDetailModel')

exports.index = async (ctx) => {
    try {
      await SalaryDetailDB .find({}, (err, users) => {
        ctx.body = users;
      });
    } catch (e) {
      ctx.body = e;
    }
};


exports.store = async (ctx) => {
    const salary = new SalaryDetailDB (ctx.request.body);
    try {
      await salary.save();
        const msg = `${salary._id} has been saved successfully`;
        ctx.status = 201;
        ctx.body = msg;
    } catch (e) {
      ctx.body = e;
    }
};
exports.delete = async (ctx) => {
  try {
    await SalaryDetailDB.findByIdAndRemove(ctx.params.id, () => {
      ctx.body = `Successfully delete salary id: ${ctx.params.id}`;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.update = async (ctx) => {
  try {
    await SalaryDetailDB.findByIdAndUpdate(ctx.params.id, ctx.request.body, { rawResult: true }, () => {
      ctx.body = `Successfully update salary id: ${ctx.params.id}`;
    });
  } catch (e) {
    ctx.body = e;
  }
};
exports.show = async (ctx) => {
  try {
    await SalaryDetailDB.findById(ctx.params.id, (err, salary) => {
      ctx.body = salary;
    });
  } catch (e) {
    ctx.body = e;
  }
};

const Voucher = require("../../../model/VoucherModel");

exports.index = async (ctx) => {
  try {
    await Voucher.find({}, (err, users) => {
      ctx.body = users;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.store = async (ctx) => {
  const voucher = new Voucher(ctx.request.body);

  try {
    await voucher.save();
    const msg = `Voucher (id:${voucher._id}) has been saved successfully, sold by ${ctx.request.body.sellername}`;
    ctx.status = 201;
    ctx.body = msg;
  } catch (e) {
    ctx.body = e;
  }
};

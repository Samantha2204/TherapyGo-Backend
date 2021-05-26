const PaymentDB = require('../../../model/PaymentModel');

exports.index = async (ctx) => {
    try {
      await PaymentDB.find({}, (err, payments) => {
        ctx.body = payments;
      });
    } catch (e) {
      ctx.body = e;
    }
};
exports.store = async (ctx) => {
    const paymentDB = new PaymentDB(ctx.request.body);   
    try {
        await paymentDB.save();
        const token = "abc";
        ctx.body = {paymentDB, token};
    } catch (e) {
        ctx.body = e;
    }
}
exports.show = async (ctx) => {
  try {
    await PaymentDB.findById(ctx.params.id, (err, paymentDB) => {
      ctx.body = paymentDB;
    });
  } catch (e) {
    ctx.body = e;
  }
};



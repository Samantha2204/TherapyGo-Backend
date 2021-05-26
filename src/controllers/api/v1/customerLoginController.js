const CustomerLoginDB = require("../../../model/CustomerLogin");
const uuid = require("uuid");

exports.index = async (ctx) => {
  try {
    await CustomerLoginDB.find({}, (err, users) => {
      ctx.body = users;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.verify = async (ctx) => {
  try {
    const email = ctx.request.body.email;
    const password = ctx.request.body.password;
    const res = await CustomerLoginDB.findOne({ email: email });

    if (res && res.password == password) {
      let token = { token: uuid.v4() };
      ctx.body = token;
    } else {
      ctx.status = 404;
      ctx.body = "User not found";
    }
  } catch (e) {
    throw new Error(`Customer Login Controller - ${e}`);
  }
};

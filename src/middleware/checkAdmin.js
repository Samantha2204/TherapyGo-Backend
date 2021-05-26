const koaJwt = require("koa-jwt");
const jwt = require("jwt-simple");
const AdminModel = require("../model/AdminModel");
exports.checkAdmin = async (ctx, next) => {
  try {
    const token = ctx.header.authorization;
    const decoded = jwt.decode(token.split(" ")[1], "therapy go secret");
    const user = await AdminModel.findOne({ email: decoded.email });
    if (!user) {
      ctx.status(500).send({ error: "No this user" });
    }
    ctx.body = user;
    return next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

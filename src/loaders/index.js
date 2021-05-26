const koaLoader = require("./koa");
const mongooseLoader = require("./mongoose");

exports.init = (koaApp) => {
  const mongoConnection = mongooseLoader();
  koaLoader(koaApp);
};

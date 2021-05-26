const koa = require("koa");
const loader = require("./src/loaders");
const bodyParser = require("koa-bodyParser");
const views = require("koa-views");
const static = require("koa-static");
const app = new koa();

app.use(
  views("src/views", {
    extension: "ejs",
  })
);
app.use(static("./src/static"));
app.use(bodyParser());

loader.init(app);

module.exports = app;

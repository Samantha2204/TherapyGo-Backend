const userController = require(`../../controllers/api/v1/user`);

const koaRouter = require("koa-router");
const router = new koaRouter();
router.get("/users", userController.index);
router.post("/users", userController.store);
router.put("/users/:id", userController.update);
router.delete("/users/:id", userController.delete);
router.get("/users/:id", userController.show);

module.exports = router;

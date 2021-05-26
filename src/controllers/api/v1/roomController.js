const RoomDB = require("../../../model/RoomModel");

exports.index = async (ctx) => {
  try {
    await RoomDB.find({}, (err, rooms) => {
      ctx.body = rooms;
    });
  } catch (e) {
    ctx.body = e;
  }
};
exports.store = async (ctx) => {
  const roomDB = new RoomDB(ctx.request.body);
  try {
    await roomDB.save();
    const token = "abc";
    ctx.body = { roomDB, token };
  } catch (e) {
    ctx.body = e;
  }
};
exports.show = async (ctx) => {
  try {
    await RoomDB.findById(ctx.params.id, (err, RoomDB) => {
      ctx.body = RoomDB;
    });
  } catch (e) {
    ctx.body = e;
  }
};

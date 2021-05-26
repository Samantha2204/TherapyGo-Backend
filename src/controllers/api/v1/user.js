const User = require('../../../model/User');

exports.index = async (ctx) => {
    try {
      await User.find({}, (err, users) => {
        ctx.body = users;
      });
    } catch (e) {
      ctx.body = e;
    }
};
exports.store = async (ctx) => {
    const user = new User(ctx.request.body);   
    try {
        await user.save();
        const token = "abc";
        ctx.body = {user, token};
    } catch (e) {
        ctx.body = e;
    }
}
exports.show = async (ctx) => {
    try {
      await User.findById(ctx.params.id, (err, user) => {
        ctx.body = user;
      });
    } catch (e) {
      ctx.body = e;
    }
};
exports.delete = async (ctx) => {
    try {
      await User.findByIdAndRemove(ctx.params.id, () => {
        ctx.body = 'Successfully delete user id: ' + ctx.params.id;
      });
    } catch (e) {
      ctx.body = e;
    }
};
exports.update = async (ctx) => {
  try {
    await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, { rawResult: true }, () => {
      ctx.body = 'Successfully update user id: ' + ctx.params.id;
    });
  } catch (e) {
    ctx.body = e;
  }
};

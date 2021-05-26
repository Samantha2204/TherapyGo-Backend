const AdminModel = require("../../../model/AdminModel");
const AdminResetPasswordToken = require("../../../model/AdminResetPasswordToken");
const jsonwebtoken = require("jsonwebtoken");
const config = require("../../../config/app");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../../../utils/email/mailSender");
const { JWT_SECRET } = require("../../../config/app");

exports.isExists = async (ctx) => {
  try {
    const { email } = ctx.params;
    if (email === undefined) {
      ctx.body = {
        message: "This email is invalid",
      };
      return;
    }

    const isRegistered = await AdminModel.exists({ email });
    if (isRegistered) {
      ctx.body = {
        message: "This email has been registered.",
      };
    } else {
      ctx.body = {
        message: "This email is valid.",
      };
    }
  } catch (error) {
    throw error;
  }
};

exports.adminList = async (ctx) => {
  try {
    const adminList = await AdminModel.find();
    ctx.body = adminList;
  } catch (error) {
    throw error;
  }
};

exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;
  const isRegistered = await AdminModel.exists({ email });
  if (!isRegistered) {
    ctx.body = {
      message: "This email is not registered or invalid.",
      code: 404,
    };
    return;
  }
  const isValid = await AdminModel.findAndCompare(email, password);
  if (isValid) {
    const token = jsonwebtoken.sign(
      {
        email,
      },
      JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    if (email == "monkeehou@gmail.com") {
      return (ctx.body = {
        token,
        code: 200,
        token: token,
        role: "boss",
        message: "Welcome log in!",
      });
    } else {
      return (ctx.body = {
        token,
        code: 200,
        token: token,
        role: "admin",
        message: "Welcome log in!",
      });
    }
  } else {
    return (ctx.body = {
      code: 404,
      message: "Email or password in incorrect...",
    });
  }
};

exports.signup = async (ctx) => {
  let adminInfo = ctx.request.body;
  const { email, name } = adminInfo;
  let isRegistered = await AdminModel.exists({ email });
  if (isRegistered) {
    return (ctx.response.body = {
      code: 409,
      message: "This email has been registered! ",
    });
  } else {
    const time = new Date().toLocaleString();
    adminInfo = { ...adminInfo, accountCreatedAt: time };
    const token = jsonwebtoken.sign(
      {
        adminInfo,
      },
      config.JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );
    const link = `http://localhost:8000/admin/activateaccount/${token}`;
    sendEmail(
      email,
      "Account Activation",
      {
        name,
        link,
      },
      "./templates/activateAdminAccount.handlebars"
    );

    return (ctx.response.body = {
      message: "Activation email sent",
    });
  }
};

exports.activateAccount = async (ctx) => {
  const { token } = ctx.request.params;
  if (token) {
    const decodedToken = jsonwebtoken.verify(token, JWT_SECRET);
    if (!decodedToken) {
      return (ctx.response.body = {
        code: 400,
        message: "Incorrect or expired link. ",
      });
    }
    let { adminInfo } = decodedToken;

    try {
      const newAdmin = new AdminModel(adminInfo);
      await newAdmin.save(function (err, data) {
        if (err) {
          return console.error(err);
        }
      });
      sendEmail(
        newAdmin.email,
        "Welcome",
        {
          name: newAdmin.name,
        },
        "./templates/welcomeAdmin.handlebars"
      );
      ctx.status = 200;
      ctx.body = {
        code: 200,
        message: "Sign up successfully!",
      };
    } catch (error) {
      return (ctx.body = {
        code: 400,
        message: "Account activation error occurs. ",
      });
    }
  } else {
    return (ctx.body = {
      message: "Invalid token!",
    });
  }
};

exports.updatePassword = async (ctx) => {
  const { email, oldPassword, newPassword } = ctx.request.body;
  const isValid = await AdminModel.findAndCompare(email, oldPassword);
  if (isValid) {
    const { _id } = isValid;
    const newInfo = {
      email: email,
      password: newPassword,
    };
    const password = await bcrypt.hash(newPassword, 10);
    await AdminModel.findByIdAndUpdate(_id, { password });
    ctx.status = 200;
    ctx.body = {
      code: 200,
      id: _id,
      message: "Password has been updated!",
    };
  }
};

exports.forgotPassword = async (ctx) => {
  const { email } = ctx.request.body;
  const isRegistered = await AdminModel.exists({ email });
  if (!isRegistered) {
    ctx.body = {
      message: "This email is not registered or invalid.",
      code: 404,
    };
    return;
  }
  const admin = await AdminModel.findOne({ email });
  let token = await AdminResetPasswordToken.findOne({ admin_id: admin._id });
  if (token) {
    await token.deleteOne();
  }
  let resetPasswordToken = crypto.randomBytes(32).toString("hex");
  const salt = await bcrypt.genSalt(10);
  const resetPasswordTokenHashed = await bcrypt.hash(resetPasswordToken, salt);
  await new AdminResetPasswordToken({
    admin_id: admin._id,
    token: resetPasswordTokenHashed,
    createdAt: Date.now(),
  }).save();

  const link = `localhost:8000/admin/resetPassword/${admin._id}/${resetPasswordToken}`;
  sendEmail(
    admin.email,
    "Password Reset Request",
    {
      name: admin.name,
      link,
    },
    "./templates/forgotAdminPassword.handlebars"
  );
  ctx.status = 200;
  ctx.body = {
    code: 200,
    message: "Reset password link is sent to your email!",
  };
};

exports.collectPassword = async (ctx) => {
  const { admin_id, resetPasswordToken } = ctx.request.params;
  let adminResetPasswordToken = await AdminResetPasswordToken.findOne({
    admin_id,
  });
  const admin = await AdminModel.findOne({ _id: admin_id });
  const admin_name = admin.name;
  if (!adminResetPasswordToken) {
    throw new Error("Invalid or expired password reset token");
  }
  await ctx.render("resetPassword.ejs", { name: admin_name });
};

exports.resetPassword = async (ctx) => {
  const { admin_id, resetPasswordToken } = ctx.request.params;
  const { password, password2 } = ctx.request.body;
  let adminResetPasswordToken = await AdminResetPasswordToken.findOne({
    admin_id,
  });
  if (!adminResetPasswordToken) {
    throw new Error("1Invalid or expired password reset token");
  }
  bcrypt.compare(
    resetPasswordToken,
    adminResetPasswordToken.token,
    function (err, res) {
      if (err) {
        console.error(err);
      }
      if (!res) {
        return console.log("Invalid token!");
      }
    }
  );

  const salt = await bcrypt.genSalt(10);
  const passwordHashed = await bcrypt.hash(password, salt);
  await AdminModel.updateOne(
    { _id: admin_id },
    { $set: { password: passwordHashed } }
  );
  const admin = await AdminModel.findById({ _id: admin_id }).select(
    "+password"
  );

  sendEmail(
    admin.email,
    "Password Reset Successfully",
    {
      name: admin.name,
    },
    "./templates/resetAdminPassword.handlebars"
  );
  await adminResetPasswordToken.deleteOne();

  ctx.status = 200;
  ctx.body = {
    code: 200,
    message: "Password updated!",
  };
};

exports.deleteOne = async (ctx) => {
  try {
    const { id } = ctx.params;
    const admin = await AdminModel.findById(id);
    if (!admin)
      return (ctx.response.body = {
        message: "Admin does not exist",
      });
    await admin.deleteOne();
    ctx.body = {
      message: `${admin.email} is deleted.`,
    };
  } catch (error) {
    throw error;
  }
};

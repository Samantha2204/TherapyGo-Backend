const Customer = require("../../../model/CustomerModel");
const Service = require("../../../model/ServiceModel");
const PaymentDB = require("../../../model/PaymentModel");
const CustomerResetPasswordToken = require("../../../model/CustomerResetPasswordToken");
const jsonwebtoken = require("jsonwebtoken");
const config = require("../../../config/app");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../../../utils/email/mailSender");
const { JWT_SECRET } = require("../../../config/app");

exports.isExisting = async (ctx) => {
  try {
    const { email } = ctx.request.body;
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
exports.customerList = async (ctx) => {
  try {
    const customerList = await Customer.find();
    ctx.body = customerList;
  } catch (error) {
    throw error;
  }
};

exports.signup = async (ctx) => {
  let customerInfo = ctx.request.body;
  const { email, name } = customerInfo;
  let isRegistered = await Customer.exists({ email });
  if (isRegistered) {
    return (ctx.body = {
      code: 409,
      message: "This email has been registered! ",
    });
  } else {
    const time = new Date().toLocaleString();
    customerInfo = { ...customerInfo, accountCreatedAt: time };
    const token = jsonwebtoken.sign(
      {
        customerInfo,
      },
      config.JWT_SECRET,
      {
        expiresIn: "30m",
      }
    );
    const link = `http://localhost:8000/customer/activateaccount/${token}`;
    sendEmail(
      email,
      "Account Activation",
      {
        name,
        link,
      },
      "./templates/activateAccount.handlebars"
    );

    return (ctx.body = {
      message: "Activation email sent",
    });
  }
};

exports.login = async (ctx, next) => {
  const { email, password } = ctx.request.body;
  const isRegistered = await Customer.exists({ email });
  const result = await Customer.find({ email: email });

  if (isRegistered) {
    const isValid = await Customer.findAndCompare(email, password);
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
      return (ctx.body = {
        token,
        code: 200,
        token: token,
        role: "customer",
        customer_id: result[0]._id,
        message: "Welcome log in!",
      });
    } else {
      return (ctx.body = {
        code: 404,
        message: "Email or password in incorrect...",
      });
    }
  }

  if (!isRegistered) {
    await next();
  }
};

exports.activateAccount = async (ctx) => {
  const { token } = ctx.request.params;
  if (token) {
    const decodedToken = jsonwebtoken.verify(token, JWT_SECRET);
    if (!decodedToken) {
      return (ctx.body = {
        code: 400,
        message: "Incorrect or expired link. ",
      });
    }
    let { customerInfo } = decodedToken;
    try {
      const newCustomer = new Customer(customerInfo);
      await newCustomer.save(function (err, data) {
        if (err) {
          return console.error(err);
        }
      });
      sendEmail(
        newCustomer.email,
        "Welcome",
        {
          name: newCustomer.name,
        },
        "./templates/welcome.handlebars"
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

exports.updatePassword = async (ctx, next) => {
  const { email, oldPassword, newPassword } = ctx.request.body;
  const isRegistered = await Customer.exists({ email });
  if (isRegistered) {
    const isValid = await Customer.findAndCompare(email, oldPassword);
    if (isValid) {
      const { _id } = isValid;
      const newInfo = {
        email: email,
        password: newPassword,
      };
      const password = await bcrypt.hash(newPassword, 10);
      await Customer.findByIdAndUpdate(_id, { password });
      ctx.status = 200;
      ctx.body = {
        code: 200,
        id: _id,
        message: "Password has been updated!",
      };
    }
  }
  if (!isRegistered) {
    await next();
  }
};

exports.forgotPassword = async (ctx, next) => {
  const { email } = ctx.request.body;
  const isRegistered = await Customer.exists({ email });

  if (isRegistered) {
    const customer = await Customer.findOne({ email });
    let token = await CustomerResetPasswordToken.findOne({
      customer_id: customer._id,
    });
    if (token) {
      await token.deleteOne();
    }
    let resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const resetPasswordTokenHashed = await bcrypt.hash(
      resetPasswordToken,
      salt
    );
    await new CustomerResetPasswordToken({
      customer_id: customer._id,
      token: resetPasswordTokenHashed,
      createdAt: Date.now(),
    }).save();

    const link = `localhost:8000/customer/resetPassword/${customer._id}/${resetPasswordToken}`;
    sendEmail(
      customer.email,
      "Password Reset Request",
      {
        name: customer.firstName,
        link,
      },
      "./templates/forgotPassword.handlebars"
    );
    ctx.status = 200;
    ctx.body = {
      code: 200,
      message: "Reset password link is sent to your email!",
    };
  }
  if (!isRegistered) {
    await next();
  }
};

exports.collectPassword = async (ctx) => {
  const { customer_id, resetPasswordToken } = ctx.request.params;
  let customerResetPasswordToken = await CustomerResetPasswordToken.findOne({
    customer_id,
  });
  const customer = await Customer.findOne({ _id: customer_id });
  const customer_name = customer.firstName;
  if (!customerResetPasswordToken) {
    throw new Error("Invalid or expired password reset token");
  }
  await ctx.render("resetPassword.ejs", { name: customer_name });
};

exports.resetPassword = async (ctx) => {
  const { customer_id, resetPasswordToken } = ctx.request.params;
  const { password, password2 } = ctx.request.body;
  let customerResetPasswordToken = await CustomerResetPasswordToken.findOne({
    customer_id,
  });
  if (!customerResetPasswordToken) {
    throw new Error("1Invalid or expired password reset token");
  }
  bcrypt.compare(
    resetPasswordToken,
    customerResetPasswordToken.token,
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
  await Customer.updateOne(
    { _id: customer_id },
    { $set: { password: passwordHashed } }
  );
  const customer = await Customer.findById({ _id: customer_id }).select(
    "+password"
  );

  sendEmail(
    customer.email,
    "Password Reset Successfully",
    {
      name: customer.firstName,
    },
    "./templates/resetPassword.handlebars"
  );
  await customerResetPasswordToken.deleteOne();

  ctx.status = 200;
  ctx.body = {
    code: 200,
    message: "Password updated!",
  };
};

exports.deleteOne = async (ctx) => {
  try {
    const { customer_id } = ctx.params;
    const customer = await Customer.findById(customer_id);
    if (!customer)
      return (ctx.body = {
        message: "Customer does not exist",
      });
    await customer.deleteOne();
    ctx.body = {
      message: `${customer.email} is deleted.`,
    };
  } catch (error) {
    throw error;
  }
};

exports.updatePersonalProfile = async (ctx) => {
  try {
    await Customer.findByIdAndUpdate(
      ctx.params.customer_id,
      ctx.request.body,
      { rawResult: true },
      () => {
        ctx.body = `Successfully update customer id: ${ctx.params.customer_id}`;
      }
    );
  } catch (e) {
    ctx.body = e;
  }
};

exports.displayPersonalProfile = async (ctx) => {
  try {
    const { customer_id } = ctx.params;
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      ctx.status = 404;
      return (ctx.body = {
        message: "Customer does not exist...",
        code: 404,
      });
    }
    ctx.status = 200;
    return (ctx.body = customer);
  } catch (error) {
    ctx.body = e;
  }
};

exports.displayOrderHistory = async (ctx) => {
  try {
    const { customer_id } = ctx.params;
    const customer = await Customer.findById(customer_id);
    if (!customer) {
      ctx.status = 404;
      return (ctx.body = {
        message: "Customer does not exist...",
        code: 404,
      });
    }
    const services = await Service.find({ customerId: customer_id }).populate({
      path: "therapistId treatmentId paymentId",
      select: [
        "salaryId",
        "firstName",
        "lastName",
        "isCertificated",
        "treatmentBodyPart",
        "treatmentPrice",
        "treatmentStyle",
        "treatmentDuration",
        "isPaid",
        "method",
      ],
    });
    let OrderNumber = 0;
    const serviceList = [];
    getDetailedServiceInfo = (service) => {
      const clientFirstname = customer.firstName;
      const clientLastname = customer.lastName;
      const client = clientFirstname.concat(" ", clientLastname);
      const therapistFirstName = service.therapistId.firstName;
      const therapistLastName = service.therapistId.lastName;
      const therapist = therapistFirstName.concat(" ", therapistLastName);
      const Insurance = service.therapistId.isCertificated ? "Yes" : "No";
      const paymentStatus = service.paymentStatus;
      const serviceId = service._id;
      OrderNumber = OrderNumber + 1;
      let date = service.date;
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      date = year + "-" + month + "-" + day;
      if (paymentStatus == "Unpaid") {
        serviceInfo = {
          serviceId,
          client,
          date,
          time: service.time,
          roomName: service.roomName,
          Insurance,
          serviceDuration: service.treatmentId.treatmentDuration,
          treatmentBodyPart: service.treatmentId.treatmentBodyPart,
          treatmentStyle: service.treatmentId.treatmentStyle,
          therapist,
          price: service.treatmentId.treatmentPrice,
          Location: "9 Rosebery",
          serviceStatus: service.status,
          paymentStatus,
          OrderNumber,
        };
      } else {
        serviceInfo = {
          serviceId,
          client,
          date,
          time: service.time,
          roomName: service.roomName,
          Insurance,
          serviceDuration: service.treatmentId.treatmentDuration,
          treatmentBodyPart: service.treatmentId.treatmentBodyPart,
          treatmentStyle: service.treatmentId.treatmentStyle,
          therapist,
          price: service.treatmentId.treatmentPrice,
          Location: "9 Rosebery",
          serviceStatus: service.status,
          paymentStatus,
          paymentType: service.paymentId.method,
          OrderNumber,
        };
      }

      serviceList.push(serviceInfo);
      return serviceList;
    };
    services.forEach(getDetailedServiceInfo);
    ctx.status = 200;
    ctx.body = {
      serviceList,
    };
  } catch (error) {
    console.error(error);
  }
};

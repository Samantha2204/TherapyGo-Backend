const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customerSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  firstName: {
    type: String,
    default: "",
    trim: true,
  },
  lastName: {
    type: String,
    default: "",
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  password: {
    require: true,
    type: String,
    minlength: 6,
    select: false,
  },
  mobile: {
    type: String,
    trim: true,
    maxlength: 15,
  },
  lastLoginAt: {
    type: String,
    default: new Date(),
  },
  accountCreatedAt: {
    type: String,
  },
  avatar: {
    type: String,
    trim: true,
  },
  __v: {
    type: Number,
    select: false,
  },
});

customerSchema.statics.findAndCompare = async (email, password) => {
  const foundUser = await Customer.findOne({ email }).select("+password");
  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false;
};

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return await next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  await next();
});

const Customer = mongoose.model("customer", customerSchema);
module.exports = Customer;

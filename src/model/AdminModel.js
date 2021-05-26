const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema, model } = mongoose;

const adminSchema = new Schema({
  name: {
    type: String,
    maxlength: 20,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    trim: true,
    index: true,
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

adminSchema.statics.findAndCompare = async (email, password) => {
  const foundUser = await AdminModel.findOne({ email }).select("+password");
  const isValid = await bcrypt.compare(password, foundUser.password);
  return isValid ? foundUser : false;
};

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return await next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  await next();
});

const AdminModel = model("Admin", adminSchema);

module.exports = AdminModel;

"use strict";

const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendEmail = async (email, subject, payload, templates) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: "therapygo2021@gmail.com",
      pass: "therapygo",
    },
  });

  const source = fs.readFileSync(path.join(__dirname, templates), "utf8");
  const compiledTemplate = handlebars.compile(source);
  const mailOptions = () => {
    return {
      from: "noreply@therapygo.com",
      to: email,
      subject: subject,
      html: compiledTemplate(payload),
    };
  };
  transporter.sendMail(mailOptions(), (error, info) => {
    if (error) {
      return console.log(error);
    } else {
      console.log("email sent!");
    }
  });
};

module.exports = sendEmail;

const aws = require("aws-sdk");
aws.config.loadFromPath("./src/config/config.json");

const ses = new aws.SES();

exports.sendEmail = (emails, callback) => {
  let params = {};
  const destination = {
    ToAddresses: emails,
  };
  const templateData = {};
  templateData.name = emails;

  params.Source = "noreply@theinvulnerable.com";
  params.Destination = destination;
  params.Template = "EmailVerify3";
  params.TemplateData = JSON.stringify(templateData);
  ses.sendTemplatedEmail(params, function (email_err, email_data) {
    if (email_err) {
      callback(email_err, email_data);
    } else {
      callback(null, email_data);
    }
  });
};

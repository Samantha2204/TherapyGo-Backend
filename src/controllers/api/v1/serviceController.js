const ServiceDB = require("../../../model/ServiceModel");
const Customer = require("../../../model/CustomerModel");

exports.index = async (ctx) => {
  try {
    await ServiceDB.find({}, (err, services) => {
      ctx.body = services;
    });
  } catch (e) {
    ctx.body = e;
  }
};
exports.store = async (ctx) => {
  const serviceDB = new ServiceDB(ctx.request.body);
  try {
    await serviceDB.save();
    const token = "abc";
    ctx.body = { serviceDB, token };
  } catch (e) {
    ctx.body = e;
  }
};
exports.show = async (ctx) => {
  try {
    await ServiceDB.findById(ctx.params.id, (err, ServiceDB) => {
      ctx.body = ServiceDB;
    });
  } catch (e) {
    ctx.body = e;
  }
};

exports.update = async (ctx) => {
  try {
    await ServiceDB.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body,
      { rawResult: true },
      () => {
        ctx.body = `Successfully update service id: ${ctx.params.id}`;
      }
    );
  } catch (e) {
    ctx.body = e;
  }
};

exports.searchService = async (ctx) => {
  try {
    const { mobile } = ctx.params;
    const customer = await Customer.findOne({ mobile: mobile });
    if (customer) {
      const services = await ServiceDB.find({ customerMobile: mobile });
      function compare(p) {
        return function (m, n) {
          var a = m[p];
          var b = n[p];
          return a - b;
        };
      }
      services.sort(compare("date"));
      let myDate = new Date();
      myDate.toLocaleDateString();
      let res = [];
      for (let index = 0; index < services.length; index++) {
        const service = services[index];
        if (service.date >= myDate && service.paymentStatus == "Unpaid") {
          let tem = {
            nextServiceDate: service.date.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            }),
            nextServiceTime: service.time,
          };
          res.push(tem);
          break;
        }
      }
      if (res.length == 0) {
        ctx.body = {
          code: 404,
          message: "This customer does not have an recent appointment with us.",
        };
      } else {
        ctx.body = {
          code: 200,
          message: `This customer's nearest service is on ${res[0].nextServiceDate} at ${res[0].nextServiceTime}.`,
        };
      }
    } else {
      ctx.code = 404;
      ctx.body = {
        code: 404,
        message: "We do not have this customer's record.",
      };
    }
  } catch (e) {
    ctx.body = e;
  }
};

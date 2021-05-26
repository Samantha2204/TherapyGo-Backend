const config = require('../config/app');
const mongoose = require('mongoose');

module.exports = async function () {
    const connection = await mongoose.connect(config.mongoose, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    });
    return connection.connection.db;
};

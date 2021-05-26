const mongoose = require("mongoose");

const salaryDetailSchem = new mongoose.Schema({
    salaryId:{
        type:mongoose.Schema.Types.ObjectId,
    },
    weeklyAmount: {
        type: Number,
        default:0
    },
    salaryRate: {
        type: String
    },
    remedialSalaryRate:{
        type: String
    },
})

const SalaryDetailDB = mongoose.model('SalaryDetail', salaryDetailSchem);

module.exports = SalaryDetailDB
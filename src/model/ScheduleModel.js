const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  date:{
      type:Date,
      require:true
  },
  therapistId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
  }],
});

const Schedule = mongoose.model('schedule', scheduleSchema);
module.exports = Schedule;

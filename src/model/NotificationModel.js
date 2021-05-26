const mongoose = require('mongoose');
const { stringify } = require('uuid');

const NotificationSchema = new mongoose.Schema(
  {
    notificationId:{
      type: mongoose.Schema.Types.ObjectId,
    },
    image: {
      type: String,
    },
    message:{
        type: String,
    },
    receivedTime:{
        type: String,
    },
    new:{
        type: Boolean,
    }
  }
)

const NotificationDB = mongoose.model('Notification', NotificationSchema);
module.exports = NotificationDB;

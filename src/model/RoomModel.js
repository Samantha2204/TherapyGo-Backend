const mongoose = require('mongoose');
const { stringify } = require('uuid');

const RoomSchema = new mongoose.Schema(
  {

    roomId:{
      type: mongoose.Schema.Types.ObjectId,
    },
    roomName: {
      type: String,
    },
    isAvailable:{
        type: Boolean,
        required: true,
        default: true
    },
    roomNumber: {
      type: Number
    }
  }
)

const RoomDB = mongoose.model('Room', RoomSchema);
module.exports = RoomDB;


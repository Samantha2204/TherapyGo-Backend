const mongoose= require('mongoose');

const treatmentSchema = new mongoose.Schema({
    treatmentId:{
        type: mongoose.Schema.Types.ObjectId,
    },
    treatmentBodyPart:{
        type: String,
        required:true,
        default:''
    },
    treatmentPrice:{
        type:Number,
        required: true
    },
    treatmentStyle:{
        type: String,
        require:true,
    },
    treatmentDuration:{
        type: Number,
        required: true
    },
    treatmentPackage:{
        type:Number
    }
});


const TreatmentDB = mongoose.model('Treatment', treatmentSchema);

module.exports = TreatmentDB;
var mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    patientId: {
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required:true
    },
    age: {
        type:String,
        required:true
    },
    pulseRate: {
        type: String
    },
    bloodPressure: {
        type:String,
    },
    temperature: {
        type:String
    }
});

const Patient = module.exports = mongoose.model ('Patient', patientSchema);

//Get Patients
module.exports.getPatients = function (callback,limit) {
   // Patient.find(callback).limit(limit);
    Patient.find();
}
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

module.exports = mongoose.model ('Patient', patientSchema);

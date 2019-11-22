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
    pulseRateLow: {
        type: String
    },
    bloodPressureLow: {
        type:String,
    },
    temperatureLow: {
        type:String
    },
    pulseRateHigh: {
        type: String
    },
    bloodPressureHigh: {
        type:String,
    },
    temperatureHigh: {
        type:String
    }
});

module.exports = mongoose.model ('Patient', patientSchema);

var mongoose = require('mongoose');

const patientSchema = mongoose.Schema({
    patientId: {
        type: String,
        required: true
    },
    name:{
        type: String
    },
    age: {
        type: Number
    },
    pulseRateLow: {
        type: Number
    },
    bloodPressureLow: {
        type:Number
    },
    temperatureLow: {
        type:Number
    },
    pulseRateHigh: { 
        type: Number
    },
    bloodPressureHigh: {
        type:Number
    },
    temperatureHigh: {
        type:Number
    },
    nurseEmail: {
        type: String
    },
    pulseRateCur: {
        type: String
    },
    bloodPressureCur: {
        type: String
    },
    temperatureCur: {
        type: String
    },
    positionCur: {
        type: String
    },
    alerts: {
        type: Number
    },
    date: {
        type: Date
        // default: Date.now
    }
});

module.exports = mongoose.model ('Patient', patientSchema);

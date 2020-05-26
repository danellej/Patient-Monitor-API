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
    bpSysLow: {
        type:Number
    },
    bpDiasLow: {
        type:Number
    },
    temperatureLow: {
        type:Number
    },
    pulseRateHigh: { 
        type: Number
    },
    temperatureHigh: {
        type:Number
    },
    bpDiasHigh: {
        type:Number
    },
    bpSysHigh: {
        type:Number
    },
    nurseEmail: {
        type: String
    },
    pulseRateCur: {
        type: String
    },
    bloodPressureSys: {
        type: String
    },
    bloodPressureDias: {
        type: String
    },
    temperatureCur: {
        type: String
    },
    positionCur: {
        type: String
    },
    alerts: {
        type: Boolean
    },
    date: {
        type: Date
        // default: Date.now
    }
});

module.exports = mongoose.model ('Patient', patientSchema);

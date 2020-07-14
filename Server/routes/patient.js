const express = require('express');
const router = express.Router();
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');
const token = '1189516018:AAEmN8685iLMIXmK4rkljRuEtkcBEMpA2xg'

const Patient = require('../models/Patient');
const bot = new TelegramBot(token, {polling: true});

// router.get ('/', (req,res) => {
//     res.sendFile('index.html', {root: path.join(__dirname, '../')});
// });

bot.on('message', (msg) => {
    bot.sendMessage(msg.chat.id, 'wassup')
});

router.get ('/1', (req,res) => {
    res.send('dxfchgjkjlk;');
});

//Add new patient
router.post('/', function(req,res) {
    var newPatient = new Patient({
        patientId: req.body.patientId,
        name : req.body.name,
        age: req.body.age,
        pulseRateLow : req.body.pulseRateLow,
        pulseRateHigh : req.body.pulseRateHigh,
        bpSysHigh : req.body.bpSysHigh,
        bpDiasHigh : req.body.bpDiasHigh,
        bpSysLow : req.body.bpSysLow,
        bpDiasLow : req.body.bpDiasLow,
        temperatureLow : req.body.temperatureLow,
        temperatureHigh : req.body.temperatureHigh,
        nurseEmail : req.body.nurseEmail,
        bloodPressureSys : req.body.bloodPressureSys,
        bloodPressureDias : req.body.bloodPressureDias
    });
    newPatient.save()
    .then ( (patient) => res.json(patient) )
    .catch ( (err) => { res.sendStatus(400);console.log(err);} );
});

var msg = "";
var sys; var dias; var alertTemp; var alertBP; var alertPulse;

router.post('/parse', function (req, res){
    var data = req.body.data
    console.log(data);

    var patientData = data.split(',');

    if (patientData.length != 8) {
        //do not continue code
    }

    var maxVolt = parseFloat(patientData[4]);
    var minVolt = parseFloat(patientData[5]);
    var systolVolt = parseFloat(patientData[6]);
    var diastolVolt = parseFloat(patientData[7]);

    if (isNaN(maxVolt) || isNaN(minVolt) || isNaN(systolVolt) || isNaN(diastolVolt)){
        //do not continue code
    }

    // console.log("voltage type: " + typeof maxVolt);
    

    Patient.find({patientId : patientData[0], name : {$ne: null} },(function(err,result){
        if (err) throw (err);
        console.log(result);
        
        var bloodPressureSys = parseInt(result[0].bloodPressureSys);
        var bloodPressureDias = parseInt(result[0].bloodPressureDias);
        console.log("----ORIGINAL SYSTOLIC: " + bloodPressureSys + " " + typeof(bloodPressureSys));
        console.log("----ORIGINAL DIASTOLIC: " + bloodPressureDias + " " + typeof(bloodPressureDias));

      sys = ((systolVolt - minVolt)/(maxVolt - minVolt) * (bloodPressureSys - bloodPressureDias)) + bloodPressureDias;
      dias = ((diastolVolt - minVolt)/(maxVolt - minVolt) * (bloodPressureSys - bloodPressureDias)) + bloodPressureDias;

    // sys = ((systolVolt - minVolt)/(maxVolt - minVolt) * (120 - 80)) + 80;
    // dias = ((diastolVolt - minVolt)/(maxVolt - minVolt) * (120 - 80)) + 80;
    }));

    var newPatient = new Patient({
        patientId: patientData[0],
        temperatureCur : patientData[1], //pulseratecur
        positionCur: patientData[2], //bloodpressurecur
        pulseRateCur : patientData[3],
        bloodPressureSys : sys.toFixed(2),
        bloodPressureDias : dias.toFixed(2),
        fullDate : new Date(),
        date : new Date().toISOString().substring(0, 10)
        // date : new Date().toLocaleDateString()
        // time : new Date().toISOString().substring(11, 19)
    });
    newPatient.save()
    .then ( (patient) => {
        console.log(`New Patient: ${patient}`);
        var query = {patientId : patient.patientId, name : {$ne : null}};
        updatequery = {patientId : patient.patientId, fullDate: patient.fullDate}

        var curPulseRate = parseInt(patient.pulseRateCur);
        var curSysPress = parseInt(patient.bloodPressureSys);
        var curDiasPress = parseInt(patient.bloodPressureDias);
        var curTemp = parseInt(patient.temperatureCur);

        var curTime = (patient.fullDate).toISOString().substring(11, 19);

        Patient.findOneAndUpdate(updatequery, {time: curTime}, function (err,patient){
            if (err) throw err;
        });

        Patient.findOne((query),(function(err,result){
            if (err) throw (err);

            if ((curPulseRate > result.pulseRateHigh) || (curPulseRate < result.pulseRateLow)){
                // console.log("Advise nurse about heart rate");
                msg += ` Current heart rate of ${curPulseRate} and limits of ${result.pulseRateLow}-${result.pulseRateHigh} bpm`
                var chat =`Patient ${result.name} with ID number ${result.patientId} has:` + msg
                bot.sendMessage(-495566996, chat);
                alertPulse = true;
            }
            else {
                // console.log("Heart rate safe");
            }
            if ((curSysPress > result.bpSysHigh) || (curSysPress < result.bpSysLow)){
                // console.log("Advise nurse about blood pressure");
                msg += ` Current systolic blood pressure of ${curSysPress} and limits of ${result.bpSysLow}-${result.bpSysHigh} mmHg`
                var chat =`Patient ${result.name} with ID number ${result.patientId} has:` + msg
                bot.sendMessage(-495566996, chat);
                alertBP = true;
            }
            else {
                // console.log("blood pressure safe");
            }
            if ((curDiasPress > result.bpDiasHigh) || (curDiasPress < result.bpDiasLow)){
                // console.log("Advise nurse about blood pressure");
                msg += ` Current diastolic blood pressure of ${curDiasPress} and limits of ${result.bpDiasLow}-${result.bpDiasHigh} mmHg`
                var chat =`Patient ${result.name} with ID number ${result.patientId} has:` + msg
                bot.sendMessage(-495566996, chat);
                alertBP = true;
            }
            else {
                // console.log("blood pressure safe");
            }
            if ((curTemp > result.temperatureHigh) || (curTemp < result.temperatureLow)){
                // console.log("Advise nurse about temperature");
                msg += ` Current temperature of ${curTemp} and limits of ${result.temperatureLow}-${result.temperatureHigh} C`
                var chat =`Patient ${result.name} with ID number ${result.patientId} has:` + msg
                bot.sendMessage(-495566996, chat);
                alertTemp = true;
            }
            else {
                // console.log("Temperature safe");
            }

            if (alertBP === true){
                Patient.findOneAndUpdate(updatequery, {bpAlert : true},function (err,patient){
                    if (err) throw err;
                    patient.markModified('patient.bpAlert');
                    patient.save();
                    console.log("----UPDATING BP DIAS----")
                });
            }
            if (alertTemp === true){
                Patient.findOneAndUpdate(updatequery, {tempAlert : true},function (err,patient){
                    if (err) throw err;
                    patient.markModified('patient.trmpAlert');
                    patient.save();
                    console.log("----UPDATING TEMP----")
                });
            }
            if (alertPulse === true){
                Patient.findOneAndUpdate(updatequery, {pulseAlert : true},function (err,patient){
                    if (err) throw err;
                    patient.markModified('patient.pulseAlert');
                    patient.save();
                    console.log("----UPDATING PULSE----")
                });
            }

            var mailOptions = {
                from : 'patientmonitor2020@gmail.com',
                to: `${result.nurseEmail}`,//`${result.nurseEmail}`,
                subject: 'Patient Update',
                text: `Patient ${result.name} with ID number ${result.patientId} has:` + msg
            };

            transporter.sendMail(mailOptions, function(err, info){
                if (err){
                    console.log(err);
                }
                else{
                    // console.log('Email sent: ' + typeof info.response);
                    res.send(info.response);
                }
            });

            msg = ""; alertBP = false; alertPulse = false; alertTemp = false;

    }));
    })
    .catch ( (err) => { res.sendStatus(400);console.log(err);} );  
});

// io.on('connection', function (socket){
//     socket.emit('newPatient', "New Patient Created");
// });

//Find all patients
router.get('/all', function(req,res) {
    Patient.find({name: {$ne:null} }, (err, patients) => {
        if (err) throw err;
        res.json(patients);
    });
});

//Find patient by id
router.get('/patientId/:patientId', function (req, res){
    Patient.findOne({patientId: req.params.patientId, name: {$ne:null}}, function(err, patient) {
        if (err) throw err;
        res.json(patient);
    });
});

//find all instances of a patient
router.get('/all/:patientId', function (req, res){
    Patient.find({patientId:req.params.patientId}, function (err, docs){
        res.json(docs)
    }).sort({fullDate:1});
});

//find patient by date
router.get('/date/:patientId/:date', function (req, res){
    console.log("Get date")
    Patient.find({patientId: req.params.patientId, date: req.params.date}, function (err, docs){
        res.json(docs)
    }).sort({fullDate:1});
});

//Update a patient
router.put('/:patientId', function (req,res){
    console.log(req.body);
    Patient.findOneAndUpdate({patientId: req.params.patientId}, req.body, function (err,patient){
        if (err) throw err;
        res.json('Updated');
    });
});

//Delete a patient by date
router.delete('/delete/:patientId/:fullDate', function(req,res){
    console.log("Delete");
    Patient.deleteMany({patientId:req.params.patientId, fullDate: req.params.fullDate}, function (err){
        if (err) throw err;
        res.json('Deleted patient by date');
    })
});

//Delete all instances of a patient
router.delete('/:patientId', function(req,res){
    console.log("Delete");
    Patient.deleteMany({patientId:req.params.patientId}, function (err){
        if (err) throw err;
        res.json('Deleted all of patient');
    })
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'patientmonitor2020@gmail.com',
        pass: 'finalproject2020'
    }
});

module.exports = router;
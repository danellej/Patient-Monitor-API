const express = require('express');
const router = express.Router();
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var nodemailer = require('nodemailer');

const Patient = require('../models/Patient');

// router.get ('/', (req,res) => {
//     res.sendFile('index.html', {root: path.join(__dirname, '../')});
// });

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
var sys; var dias;

router.post('/parse', function (req, res){
    var data = req.body.data
    console.log(data);

    var patientData = data.split(',');

    var maxVolt = parseFloat(patientData[4]);
    var minVolt = parseFloat(patientData[5]);
    var systolVolt = parseFloat(patientData[6]);
    var diastolVolt = parseFloat(patientData[7]);

    console.log("voltage type: " + typeof maxVolt);
    

    Patient.findOne({patientId : patientData[0]},(function(err,result){
        if (err) throw (err);
        console.log(result);

    //   sys = ((systolVolt - minVolt)/(maxVolt - minVolt) * (result.bloodPressureSys - result.bloodPressureDias)) + result.bloodPressureDias;
    //   dias = ((diastolVolt - minVolt)/(maxVolt - minVolt) * (result.bloodPressureSys - result.bloodPressureDias)) + result.bloodPressureDias;

    sys = ((systolVolt - minVolt)/(maxVolt - minVolt) * (120 - 80)) + 80;
    dias = ((diastolVolt - minVolt)/(maxVolt - minVolt) * (120 - 80)) + 80;
    }));

    var newPatient = new Patient({
        patientId: patientData[0],
        temperatureCur : patientData[1], //pulseratecur
        positionCur: patientData[2], //bloodpressurecur
        pulseRateCur : patientData[3],
        bloodPressureSys : sys,
        bloodPressureDias : dias,
        date : new Date()
    });
    newPatient.save()
    .then ( (patient) => {
        console.log(`New Patient: ${patient}`);
        var query = {patientId : patient.patientId};

        var curPulseRate = parseInt(patient.pulseRateCur);
        var curSysPress = parseInt(patient.bloodPressureSys);
        var curDiasPress = parseInt(patient.bloodPressureDias);
        var curTemp = parseInt(patient.temperatureCur);

        Patient.findOne((query),(function(err,result){
            if (err) throw (err);
            console.log(result);
            result.alerts = false;

            if ((curPulseRate > result.pulseRateHigh) || (curPulseRate < result.pulseRateLow)){
                console.log("Advise nurse about heart rate");
                msg += ` Current heart rate of ${curPulseRate} and limits of ${result.pulseRateLow}-${result.pulseRateHigh} bpm`
                result.alerts = true;
            }
            else {
                console.log("Heart rate safe");
            }
            if ((curSysPress > result.bpSysHigh) || (curSysPress < result.bpSysLow)){
                console.log("Advise nurse about blood pressure");
                msg += ` Current blood pressure of ${curSysPress} and limits of ${result.bpSysLow}/${result.bpDiasLow}-${result.bpSysHigh}/${result.bpDiasHigh} mmHg`
                result.alerts = true;
            }
            else {
                console.log("blood pressure safe");
            }
            if ((curDiasPress > result.bpDiasHigh) || (curDiasPress < result.bpDiasLow)){
                console.log("Advise nurse about blood pressure");
                msg += ` Current blood pressure of ${curDiasPress} and limits of ${result.bpSysLow}/${result.bpDiasLow}-${result.bpSysHigh}/${result.bpDiasHigh} mmHg`
                result.alerts = true;
            }
            else {
                console.log("blood pressure safe");
            }
            if ((curTemp > result.temperatureHigh) || (curTemp < result.temperatureLow)){
                console.log("Advise nurse about temperature");
                msg += ` Current temperature of ${curTemp} and limits of ${result.temperatureLow}-${result.temperatureHigh} C`
                result.alerts = true;
            }
            else {
                console.log("Temperature safe");
            }

            var mailOptions = {
                from : 'patientmonitor2020@gmail.com',
                to: 'patientmonitor2020@gmail.com',//`${result.nurseEmail}`,
                subject: 'Patient Update',
                text: `Patient ${result.name} with ID number ${result.patientId} has:` + msg
            };

            transporter.sendMail(mailOptions, function(err, info){
                if (err){
                    console.log(err);
                }
                else{
                    console.log('Email sent: ' + typeof info.response);
                    res.send(info.response);
                }
            });

            msg = "";

    }));
    })
    .catch ( (err) => { res.sendStatus(400);console.log(err);} );  
});

// io.on('connection', function (socket){
//     socket.emit('newPatient', "New Patient Created");
// });

//Find all patients
router.get('/all', function(req,res) {
    Patient.find((err, patients) => {
        if (err) throw err;
        res.json(patients);
    });
});

//Find patient by id
router.get('/patientId/:patientId', function (req, res){
    Patient.findOne({patientId: req.params.patientId}, function(err, patient) {
        if (err) throw err;
        res.json(patient);
    });
});

//find all instances of a patient
router.get('/all/:patientId', function (req, res){
    Patient.find({patientId:req.params.patientId}, function (err, docs){
        res.json(docs)
    });
});

//find patient by date
router.get('/date/:patientId/:date', function (req, res){
    console.log("Get date")
    Patient.find({patientId: req.params.patientId, date: req.params.date}, function (err, docs){
        res.json(docs)
    });
});

//Update a patient
router.put('/:patientId', function (req,res){
    console.log(req.body);
    Patient.findOneAndUpdate({patientId: req.params.patientId}, req.body, function (err,patient){
        if (err) throw err;
        res.json('Updated');
    });
});

//Delete a patient
router.delete('/:patientId', function(req,res){
    console.log("Delete");
    Patient.findOneAndRemove({patientId:req.params.patientId}, function (err){
        if (err) throw err;
        res.json('Deleted');
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
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
        bloodPressureLow : req.body.bloodPressureLow,
        bloodPressureHigh : req.body.bloodPressureHigh,
        temperatureLow : req.body.temperatureLow,
        temperatureHigh : req.body.temperatureHigh
    });
    newPatient.save()
    .then ( (patient) => res.json(patient) )
    .catch ( (err) => { res.sendStatus(400);console.log(err);} );
});

router.post('/parse', function (req, res){
    var data = req.body.data
    console.log(data);

    var patientData = data.split(',');

    var newPatient = new Patient({
        patientId: patientData[0],
        temperatureCur : patientData[1], //pulseratecur
        positionCur: patientData[2], //bloodpressurecur
        pulseRateCur : patientData[3],
        bloodPressureCur : patientData[4],
        date = new Date()
    });
    newPatient.save()
    .then ( (patient) => {
        console.log(`New Patient: ${patient}`);
        var query = {patientId : patient.patientId};
        var info = patient.pulseRateCur;

        var curPulseRate = parseInt(patient.pulseRateCur);
        var curBloodPress = parseInt(patient.bloodPressureCur);
        var curTemp = parseInt(patient.temperatureCur);

        // var date = new Date();

        console.log(`Cur Pulse: ${curPulseRate}`);

        Patient.findOne((query),(function(err,result){
            if (err) throw (err);
            res.json(result);
            console.log(result);
            console.log(`Low Pulse: ${result.pulseRateLow}`);
            console.log(`High Pulse: ${result.pulseRateHigh}`);

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
                    console.log('Email sent: ' + info.response);
                }
            });
            var msg = ""

            if ((curPulseRate > result.puslseRateHigh) || (curPulseRate < result.pulseRateLow)){
                console.log("Advise nurse about heart rate");
                msg += ` Current heart rate of ${curPulseRate} and limits of ${result.pulseRateLow}-${result.puslseRateHigh} bpm`
                result.alerts++;
            }
            else {
                console.log("Heart rate safe");
            }
            if ((curBloodPress > result.bloodPressureHigh) || (curBloodPress < result.bloodPressureLow)){
                console.log("Advise nurse about blood pressure");
                msg += ` Current blood pressure of ${curBloodPress} and limits of ${result.bloodPressureLow}-${result.bloodPressureHigh} mmHg`
                result.alerts++;
            }
            else {
                console.log("blood pressure safe");
            }
            if ((curTemp > result.temperatureHigh) || (result < patient.temperatureLow)){
                console.log("Advise nurse about temperature");
                msg += ` Current temperature of ${curTemp} and limits of ${result.temperatureLow}-${result.temperatureHigh} C`
                result.alerts++;
            }
            else {
                console.log("Temperature safe");
            }
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
router.get('/:patientId', function (req, res){
    Patient.findOne({patientId: req.params.patientId}, function(err, patient) {
        if (err) throw err;
        res.json(patient);
    });
});

//find all instances of a patient
router.get('/:patientId/all', function (req, res){
    Patient.find({patientId:req.params.patientId}, function (err, docs){
        res.json(docs);
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
const express = require('express');
const router = express.Router();
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var nodemailer = require('nodemailer');

const Patient = require('../models/Patient');

router.get ('/', (req,res) => {
    res.sendFile('index.html', {root: path.join(__dirname, '../')});
    //res.send('Welcome to Patient Monitor from route');
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
        puslseRateHigh : req.body.puslseRateHigh,
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
        pulseRateCur : patientData[1], //pulseratecur
        bloodPressureCur: patientData[2], //bloodpressurecur
        temperatureCur : patientData[3],
        positionCur : patientData[4]
    });
    newPatient.save()
    .then ( (patient) => {
        console.log(`New Patient: ${patient}`);
        var query = {patientId : patient.patientId};
        var info = patient.pulseRateCur;

        var curPulseRate = parseInt(patient.pulseRateCur);
        var curBloodPress = parseInt(patient.bloodPressureCur);
        var curTemp = parseInt(patient.temperatureCur);

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
                text: 'Check on patient (indicate current param and set param)'
            };

            transporter.sendMail(mailOptions, function(err, info){
                if (error){
                    console.log(error);
                }
                else{
                    console.log('Email sent: ' + info.response);
                }
            });

            if (/*(curPulseRate > result.puslseRateHigh) ||*/ (curPulseRate < result.pulseRateLow)){
                console.log("Advise nurse about heart rate");
            }
            else {
                console.log("Heart rate safe");
            }
            if ((curBloodPress > result.bloodPressureHigh) || (curBloodPress < result.bloodPressureLow)){
                console.log("Advise nurse about blood pressure");
            }
            else {
                console.log("blood pressure safe");
            }
            if ((curTemp > result.temperatureHigh) || (result < patient.temperatureLow)){
                console.log("Advise nurse about temperature");
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
    console.log("route working");
    Patient.findOne({patientId: req.params.patientId}, function(err, patient) {
        if (err) throw err;
        res.json(patient);
        //patient.bloodPressure.equals
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
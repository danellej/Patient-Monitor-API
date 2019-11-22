const express = require('express');
const router = express.Router();
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);
var path = require('path');

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
    .catch ( (err) => res.sendStatus(400).json('Bad request'));

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
    Patient.findOneAndRemove({patientId:req.params.patientId}, function (err){
        if (err) throw err;
        res.json('Deleted');
    })
});

module.exports = router;
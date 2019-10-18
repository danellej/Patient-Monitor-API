const express = require('express');
const router = express.Router();

const Patient = require('../models/Patient');

router.get ('/', (req,res) => {
    res.send('Welcome to Patient Monitor from route');
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
    });
    newPatient.save()
    .then ( (patient) => res.json(patient) )
    .catch ( (err) => res.sendStatus(400).json('Bad request'));
});

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

//router.get('', app.welcome_page);

module.exports = router;
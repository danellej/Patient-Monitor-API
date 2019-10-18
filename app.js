const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.use(express.json());

mongoose.connect(process.env.PATIENT_MONITOR_MONGO, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, 
useFindAndModify:false });
const db = mongoose.connection;

// app.get('', function(req, res) {
//     res.send('Welcome to Patient Monitor');
// });

//TRYING TO ADD ROUTES
app.use('/patient', require('./routes/patient'));

var port = process.env.PATIENT_MONITOR_PORT || 5500;

app.listen(port, () => console.log(`Running on port ${port}...`));

var express = require('express');
var app = express();
//var http = require('http');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var cors = require('cors');
var fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.token

require('dotenv').config();

app.use(express.json());
app.use(cors());

console.log(process.env.PATIENT_MONITOR_MONGO);

const mongoose = require('mongoose');
mongoose.connect(process.env.PATIENT_MONITOR_MONGO, { useMongoClient:true });
// mongoose.connect(process.env.PATIENT_MONITOR_MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

var port = process.env.PATIENT_MONITOR_PORT || 5500;

server.listen(port, () => console.log(`Running on port ${port}...`));

//ADD ROUTES
app.use('/patient', require('./routes/patient'));

io.on('connection', function (socket){
    socket.emit('newPatient', "New Patient Created");
});
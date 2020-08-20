const express = require("express");
const moment = require('moment');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const userModel = require('./models/UsersModel');

mongoose.connect(
  'mongodb://localhost:27017/middleware',
  { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(logger.error(503, 'MongoDb Unable to Connect', err));
    } else {
      console.log('MongoDB connected Successfully')
    }
  });

app.use(cors());
app.use(bodyParser.json())
app.use(function (req, res, next) {
  let randomNo = Math.floor(Math.random(5) * 100000000);
  let newRequestID = 'Request_' + randomNo;
  let currentDate = new Date();
  let newDate = moment(currentDate).utcOffset("+05:30").format('YYYY-MM-DD hh:mm:ss');
  req.headers['requestedDetails'] = { requestedID: newRequestID, requestedTime: newDate, originalRequestTime: currentDate };
  next();
});

app.post("/register", function (req, res, next) {
  //complete execution
  let responseDetails = {}
  let newUser = new userModel(req.body);
  newUser.save((err) => {
    if (err) {
      responseDetails = { success: false, message: 'Internal server error occured', err: err };
      recordNote(req);
      //response back to client
      res.send(responseDetails);
      //call the next middleware to save evrything
      next(req.headers.requestedDetails);
    } else {
      responseDetails = { success: true, message: 'Data saved successfully' }
      recordNote(req);
      //response back to client
      res.send(responseDetails);
      //call the next middleware to save evrything
      next(req.headers.requestedDetails);
    }
  })
})

app.use(function (requestedDetails, req, res, next) {
  let timeDiff = findTImeDifference(requestedDetails)
  let finalData = requestedDetails.requestedID + `: ` + `Request Time- ${requestedDetails.requestedTime}, ` + `Response Time- ${requestedDetails.responseTime}, Total execution time- ${timeDiff} \n`
  fs.appendFileSync("info_log.txt", finalData);
  next();
});

function findTImeDifference(requestedDetails) {
  var fromTime = new Date(requestedDetails.originalRequestTime);
  var toTime = new Date(requestedDetails.originalResponseTime);
  var differenceTravel = toTime.getTime() - fromTime.getTime();
  var seconds = Math.floor((differenceTravel) / (1000));
  return seconds;
}

function recordNote(req) {
  //note down required details before response
  let currentDate = new Date();
  req.headers.requestedDetails['responseTime'] = moment(currentDate).utcOffset("+05:30").format('YYYY-MM-DD hh:mm:ss');
  req.headers.requestedDetails['originalResponseTime'] = currentDate;
}

app.listen(3000, (err) => {
  if (err) {
    throw err;
  } else {
    console.log('server running 3000')
  }
});
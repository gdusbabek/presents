var Statuses = {
  Awake: 'awake',
  Sleeping: 'sleeping'
};

var http = require('http');
var express = require('express');
var timers = require('timers');
var fs = require('fs');

var appStates = {};
var OK = JSON.stringify({status: 'OK'});
var stateFile = process.env.STATE_FILE || '/tmp/presents.json';

function getAppState(token) {
  var state = appStates[token];
  if (!state) {
    state = {
      status: Statuses.Sleeping,
      interest: null
    };
    appStates[token] = state;
  }
  return state;
}

function updateStatus(req, res, next) {
  getAppState(req.params.token).status = req.params.status;
  res.send(OK);
}

function getState(req, res, next) {
  console.log('getting state ' + req.params.token);
  res.send(JSON.stringify(getAppState(req.params.token)));
}

function updateInterest(req, res, next) {
  getAppState(req.params.token).interest = req.params.interest;
  res.send(OK);
}

function getAllStates(req, res, next) {
  if (req.params.pretty) {
    res.send(JSON.stringify(appStates, null, 4));
  } else {
    res.send(JSON.stringify(appStates));
  }
}

function saveState(file) {
  console.log('writing state to ' + file);
  fs.writeFileSync(file, JSON.stringify(appStates, null, 2));
}

var app = express();

app.set('port', process.env.PORT || 8081);
app.set('stateFile', stateFile);
app.set('/', function(req, res) {
  res.send('<html><body><p>Root of global Presents.</p></body></html>')
});
app.put('/nodes/status/:token/:status', updateStatus);
app.put('/nodes/interest/:token/:interest', updateInterest);
app.get('/nodes/:token', getState);
app.get('/nodes', getAllStates);

// todo: read state if it exists.

http.createServer(app).listen(app.get('port'), function() {
  console.log('Global Presents have started on port ' + app.get('port'));
});


timers.setInterval(saveState.bind(null, stateFile), 30000);
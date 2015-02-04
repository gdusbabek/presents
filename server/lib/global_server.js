var Statuses = {
  Awake: 'awake',
  Sleeping: 'sleeping',
  Unknown: 'unknown'
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
      interest: null,
      interest_status: null
    };
    appStates[token] = state;
  }
  return state;
}

function updateStatus(req, res, next) {
  console.log('updating status for ' + req.params.token + ' to ' + req.params.status);
  getAppState(req.params.token).status = req.params.status;
  res.send(OK);
}

function getState(req, res, next) {
  //console.log('getting state ' + req.params.token);
  var state = getAppState(req.params.token);
  if (state.interest) {
    state.interest_status = getAppState(state.interest).status;
  }
  res.send(JSON.stringify(state));
}

function updateInterest(req, res, next) {
  console.log('updating interest for ' + req.params.token + ' to ' + req.params.interest);
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
  //console.log('writing state to ' + file);
  fs.writeFileSync(file, JSON.stringify(appStates, null, 2));
}

function readState(file) {
  if (fs.existsSync(file)) {
    console.log('Reading existing state file at ' + file);
    return JSON.parse(fs.readFileSync(file));
  } else {
    console.log('Sync file not found, creating new.');
    return {};
  }
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

console.log('Using state file at: ' + stateFile);
appStates = readState(stateFile);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Global Presents have started on port ' + app.get('port'));
});


timers.setInterval(saveState.bind(null, stateFile), 1000);
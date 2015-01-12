var http = require('http');
var express = require('express');
var timers = require('timers');

// decent express tutorial:
// http://www.raywenderlich.com/61078/write-simple-node-jsmongodb-web-service-ios-app
var Statuses = {
  Awake: 'awake',
  Sleeping: 'sleeping'
};

var OK = { status: 'OK'};

function State(token) {
  this.token = token;
  this.status = Statuses.Sleeping;
  this.interestStatus = false;
  this.interestToken = ''
  this.identifyOn = false;
  this.identifySince = 0;
  this.updatedAt = 0;
  this.label = token;
}

State.prototype.setLabel = function(newLabel) {
  this.label = newLabel;
  this.updatedAt = Date.now();
}

State.prototype.setStatus = function(newStatus) {
  this.status = newStatus;
  this.updatedAt = Date.now();
};

State.prototype.setInterest = function(state) {
  this.interestToken = state.token;
  this.interestStatus = state.status;
  this.updatedAt = Date.now();
};

function AppState() {
  this.states = {};
}

AppState.prototype.getTokenState = function(token) {
  if (!this.states.hasOwnProperty(token)) {
    this.states[token] = new State(token);
  }
  return this.states[token];
};

AppState.prototype.changeStatus = function(token, status) {
  var state = this.getTokenState(token);
  var self = this;
  state.setStatus(status);
  Object.keys(this.states).forEach(function (t) {
    if (self.states[t].interestToken === token) {
      self.states[t].setInterest(state);
    }
  });
};


var appStates = new AppState();
var app = express();

// return the state for a token.
function getState(req, res, next) {
  var token = req.params.token,
      state = appStates.getTokenState(token);
  res.send(JSON.stringify(state));  
}

// state identify state on a token for 15 seconds
function identifyToken(req, res, next) {
  var token = req.params.token;
  var state = appStates.getTokenState(token);
  state.identifyOn = true;
  state.identifySince = Date.now();
  
  // stop identifying in 15 seconds.
  timers.setTimeout(function() {
    state.identifyOn = false;
    state.identifySince = 0;
  }, 15000);
  res.send(JSON.stringify(OK));
}

function updateStatus(req, res, next) {
  appStates.changeStatus(req.params.token, req.params.status);
  res.send(JSON.stringify(OK));
}

function updateInterest(req, res, next) {
  appStates.getTokenState(req.params.token).setInterest(appStates.getTokenState(req.params.interest));
  res.send(JSON.stringify(OK));
}

function updateLabel(req, res, next) {
  appStates.getTokenState(req.params.token).setLabel(req.params.label);
  res.send(JSON.stringify(OK));
}

function dashboard(req, res, next) {
  var str = '<html><body>';
  Object.keys(appStates.states).forEach(function(token) {
    str += statep(appStates.states[token]) + '\n';
  });
  str += '</body></html>';
  res.send(str);
}

function statep(state) {
  var str = '<p>' 
      + state.token + '<br/>'
      + state.label + '<br/>'
      + state.status + '<br/>'
      + state.interestToken + '<br/>'
      + state.interestStatus + '<br/>'
      + state.identifyOn + '<br/>'
      + '</p>';
  return str;
  
}


app.set('port', process.env.PORT || 8081);
app.get('/', function root(req, res) {
  res.send('<html><body>Root of Presents.</body></html>')
});
app.get('/states/:token', getState);
app.get('/states/:token/status/:status', updateStatus);
app.get('/states/:token/interest/:interest', updateInterest);
app.get('/states/:token/label/:label', updateLabel);
app.get('/identify/:token', identifyToken);
app.get('/dashboard', dashboard)



http.createServer(app).listen(app.get('port'), function() {
  console.log('Presents have started on port ' + app.get('port'));
});

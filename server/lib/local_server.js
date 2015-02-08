var http = require('http');
var express = require('express');
var fs = require('fs');
var crypto = require('crypto');

var async = require('async');
var gpio = require('rpi-gpio');

var Client = require('./global_client').Client;
var lights = require('./lights');

var app = express();

var statusFile = process.env.STATUS_FILE || '/opt/presents/status';
var interestFile = process.env.INTEREST_FILE || '/opt/presents/interest';
var client = new Client(process.env.GLOBAL_HOST || '127.0.0.1', process.env.GLOBAL_PORT || 8081);
var OK = JSON.stringify({status: 'OK'});
var localToken = '???';

var LOCAL_STATUS_PIN = process.env.LOCAL_STATUS_PIN;
var REMOTE_STATUS_PIN = process.env.REMOTE_STATUS_PIN;
var AWAKE_BUTTON_PIN = process.env.AWAKE_BUTTON_PIN;
var hasGpio = LOCAL_STATUS_PIN > 0 && REMOTE_STATUS_PIN > 0 && AWAKE_BUTTON_PIN > 0;

function buildLocalToken(callback) {
  if (process.env.TOKEN) {
    callback(null, process.env.TOKEN);
  }else if (process.platform === 'darwin') {
    callback(null, 'lame_darwin');
  } else if (process.platform === 'linux') {
    localTokenLinux(callback);
  } else {
    callback(null, '????');
  }
}

function localTokenLinux(callback) {
  var algo = crypto.createHash('md5');
  algo.update(fs.readFileSync('/proc/cpuinfo'));
  callback(null, algo.digest('hex'));
}

function updateStatus(req, res, next) {
  fs.writeFileSync(statusFile, req.params.status);
  client.setState(localToken, req.params.status, function(err, obj) {
    // ignore errors for now.
    res.send(JSON.stringify(obj));
  });
}

function updateInterest(req, res, next) {
  fs.writeFileSync(interestFile, req.params.token);
  client.setInterest(localToken, req.params.token, function(err, obj) {
    // ignore errors for now.
    res.send(JSON.stringify(obj));
  });
}

function dumpState(req, res, next) {
  var status = fs.readFileSync(statusFile),
      interest = fs.readFileSync(interestFile),
      state = {
        status: status,
        interest: interest
      };
  res.send(JSON.stringify(state));
}

app.set('port', process.env.LOCAL_PORT || 8082);
app.set('/', function(req, res) {
  res.send('<html><body><p>Root of local Presents.</p></body>')
});

// update my status
app.put('/status/:status', updateStatus);

// update my interest
app.put('/interest/:token', updateInterest);

// show my state.
app.get('/state', dumpState);

function setLocalToken(callback) {
  buildLocalToken(function(err, token) {
    if (err) {
      callback(err, null);
    } else {
      localToken = token;
      console.log('Local token is ' + localToken);
      callback(null, token);
    }
  });
}

function startServer(callback) {
  http.createServer(app).listen(app.get('port'), function() {
    console.log('Local Presents have started on port ' + app.get('port'));
    callback(null, 'server was started');
  });
}

function startPullTimer(callback) {
  var ival = setInterval(function getServerState() {
    client.getState(localToken, function(err, obj) {
      console.log(obj);
      fs.writeFileSync(statusFile, obj.interest_status);
      fs.writeFileSync(interestFile, obj.interest);
      if (hasGpio) {
        if (obj.interest_status === 'awake') {
          lights.on(11, function (err) {});
        } else if (obj.interest_status === 'sleeping') {
          lights.off(11, function (err) {});
        } else {
          // dunno.
        }
      } else {
        // 
      }
    });
  }, 15000);
  callback(null, ival);
}

function buttonAwareness(callback) {
  if (hasGpio) {
    gpio.on('change', function (channel, value) {
      console.log('Channel ' + channel + ' value is now ' + value);
    });
    gpio.setup(AWAKE_BUTTON_PIN, gpio.DIR_IN);
  }
  callback(null, null);
}

async.series([
  setLocalToken,
  buttonAwareness,
  startServer,
  startPullTimer
], function(err, results) {
  if (err) {
    console.log('There was a problem');
    console.log(err);
    process.exit(-1);
  } else {
    //console.log(results);
    console.log('interest file: ' + interestFile);
    console.log('status file: ' + statusFile);
    console.log('All is good');
  }
});

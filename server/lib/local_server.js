var http = require('http');
var express = require('express');
var timers = require('timers');
var fs = require('fs');
var crypto = require('crypto');
var child_process = require('child_process');

var async = require('async');

var Client = require('./global_client').Client;

var app = express();

var statusFile = process.env.STATUS_FILE || '/opt/presents/status';
var interestFile = process.env.INTEREST_FILE || '/opt/presents/interest';
var client = new Client(process.env.SERVER_HOST || '127.0.0.1', process.env.SERVER_PORT || 8081);
var OK = JSON.stringify({status: 'OK'});
var localToken = '???';

function buildLocalToken(callback) {
  if (process.platform === 'darwin') {
    localTokenMac(callback);
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

function localTokenMac(callback) {
  //var cmd = 'system_profiler SPHardwareDataType | awk \'/Serial Number/ { print $4; }\'',
  //    shCmd = child_process.spawn('/bin/bash', ['-c', cmd]),
  //    results = '';
  //shCmd.on('data', function(data) {
  //  results += data;
  //  console.log(data);
  //});
  //shCmd.on('close', function(code) {
  //  console.log(code);
  //  callback(null, results);
  //});
  //shCmd.on('error', function(err) {
  //  console.log(err);
  //  callback(err, results);
  //});
  callback(null, 'lame_mac_token_0000');
}

function updateStatus(req, res, next) {
  fs.writeFileSync(statusFile, req.params.status);
  client.setState(localToken, req.params.state, function(err, obj) {
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

app.set('port', process.env.PORT || 8082);
app.set('/', function(req, res) {
  res.send('<html><body><p>Root of local Presents.</p></body>')
});
app.put('/status/:status', updateStatus);
app.put('/interest/:token', updateInterest);
app.put('/state', dumpState);

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
      fs.writeFileSync(statusFile, obj.status);
      fs.writeFileSync(interestFile, obj.interest);
    });
  }, 15000);
  callback(null, ival);
}

async.series([
  setLocalToken,
  startServer,
  startPullTimer,
], function(err, results) {
  if (err) {
    console.log('There was a problem');
    console.log(err);
    process.exit(-1);
  } else {
    console.log(results);
    console.log('All is good');
  }
});

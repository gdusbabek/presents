
var exports = module.exports = {};
var request = require('request');

function Client(host, port) {
  this.host = host;
  this.port = port;
}

// var Client = require('./server/lib/global_client').Client;
// var client = new Client('127.0.0.1', 8081);
// client.setState(42, 'awake', function(err, obj) { console.log(err || obj); });

Client.prototype._buildURL = function() {
  var args = Array.prototype.slice.call(arguments),
      url = 'http://' + this.host + ':' + this.port;
  args.forEach(function(arg) {
    url += '/' + arg;
  });
  return url;
};

Client.prototype.getState = function(token, callback) {
  var self = this;
  request({
    method: 'GET',
    uri: self._buildURL('nodes', token)
  }, function(err, res, body) {
    callback(err, body ? JSON.parse(body) : {});
  });
};

Client.prototype.setState = function(token, state, callback) {
  var self = this;
  request({
    method: 'PUT',
    url: self._buildURL('nodes', 'status', token, state)
  }, function(err, res, body) {
    callback(err, body ? JSON.parse(body) : {});
  });
};

Client.prototype.setInterest = function(token, interest, callback) {
  var self = this;
  request({
    method: 'PUT',
    url: self._buildURL('nodes', 'interest', token, interest)
  }, function(err, res, body) {
    callback(err, body ? JSON.parse(body) : {});
  });
  
};

exports.Client = Client;
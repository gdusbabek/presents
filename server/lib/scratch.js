
var request = require('request');

request.
  put('http://127.0.0.1:8081/nodes/status/42/awake')
  .on('response', function(res) {
    console.log("PUT RESPONSE");
    console.log(Object.keys(res));
    console.log(res.statusCode);

  })
  .on('error', function(err) {
    console.log('PUT ERR');
    // err.code, err.errno, err.syscall
    console.log(Object.keys(err));
  });

request({
  method: 'PUT',
  uri: 'http://127.0.0.1:8081/nodes/status/42/awake'
}, function(err, res, body) {
  if (err) {
    console.log('BAD');
    console.log(Object.keys(err));
  } else {
    console.log(body);
  }
});
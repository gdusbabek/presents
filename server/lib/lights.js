
var gpio = require('rpi-gpio');


function doPin(pin, on, callback) {
  gpio.setup(pin, gpio.DIR_OUT, function() {
    gpio.write(pin, on, callback);
  });
}

function on(pin, callback) {
  console.log('ON ' + pin);
  doPin(pin, true, callback);
}

function off(pin, callback) {
  console.log('OFF ' + pin);
  doPin(pin, false, callback);
}

exports.on = on;
exports.off = off;
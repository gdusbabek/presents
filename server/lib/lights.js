
var gpio = require('rpi-gpio');


function doPin(pin, on, callback) {
  gpio.setup(pin, gpio.DIR_OUT, function() {
    gpio.write(pin, on, callback);
  });
}

function on(pin, callback) {
  doPin(pin, true, callback);
}

function off(pin, callback) {
  doPin(pin, false, callback);
}

exports.on = on;
exports.off = off;
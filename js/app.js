/*

  GE XLP Dashboard

  (c) Decoded 2018

*/

// Which Edge Device are we reading? Update with your device
var device = 'xlp-47';

// Define sensor data
// min/max correspond to sensor ranges
// color corresponds to d3 categorical color
var sensors = {
  'Button' : { 'min': 0, 'max': 2, 'color': 'category1' },
  'Light' : { 'min': 0, 'max': 1024, 'color': 'category2' },
  'RotaryAngle' : { 'min': 0, 'max': 320, 'color': 'category3' }, 
  'Temperature' : { 'min': 0, 'max': 100, 'color': 'category4', 'avg': 19.2 }, // in degrees C
  'Humidity' : { 'min': 0, 'max': 100, 'color': 'category5', 'avg': 20.1 },
};

// Initialize charts
var charts = {};

for (var sensor in sensors) {
  charts[sensor] = $(`#${sensor}`).epoch({
    type: 'time.line',
    data: [{
      label: sensor,
      values: []
    }],
    margins: {right: 30, left: 30, bottom: 20, top: 20},
    ticks: {time: 5},
    range: [sensors[sensor].min, sensors[sensor].max],
    axes: ['bottom', 'left', 'right']
  });

  // switch to correct d3 color
  charts[sensor].getVisibleLayers()[0].className =
    charts[sensor].getVisibleLayers()[0].className.replace('category1', sensors[sensor].color);

}

var socket = io.connect('https://ge-xlp-gateway.herokuapp.com/');
// var socket = io.connect('http://localhost:5000/');

socket.on('connect', function () {
  console.log("Connected to websocket"); // 'G5p5...'
});

socket.on('disconnect', function () {
  console.error("Disconnected from websocket");
});

socket.on(device, function (data) {
  console.log(`Received data for ${device}`);
  data.forEach(function (sensor) {
    // filter for data we want
    var re = new RegExp(`-${device}$`);
    var sensorName = sensor.name.replace(re,'');

    if (sensorName in sensors) {
      $(`#${sensorName}_value`).html(sensor.value);
      console.log(new Date(sensor.timestamp), `${sensorName}: ${sensor.value}`);
      charts[sensorName].push([{time: sensor.timestamp/1000, y: sensor.value}]);
    } // end checking if valid sensor
  });
});

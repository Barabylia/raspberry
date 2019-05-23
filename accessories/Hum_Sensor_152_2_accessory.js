var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

var RoomHumidity = 0.0;
var MQTT_TOPIC = 'hum2'; //MQTT topic that was set on the Sonoff firmware
var debug = 0;

// MQTT Setup
var mqtt = require('mqtt');
if (debug==1){console.log("Connecting to MQTT broker...");}
var mqtt = require('mqtt');
var options = {
    port: 1883,
    //host: '192.168.1.92',  //MQTT server IP address
    clientId: MQTT_TOPIC+'HAP'
};
var client = mqtt.connect(options);
if (debug==1){console.log("Humidity Sensor Connected to MQTT broker");}
client.subscribe(MQTT_TOPIC);
client.on('message', function(topic, message) {
    if (debug==1){console.log(parseFloat(message));}
    RoomHumidity = parseFloat(message);
});

// here's a fake humidity sensor device that we'll expose to HomeKit
var ROOM_HUMIDITY_SENSOR = {

  getHumidity: function() { 
    if (debug==1){console.log("Getting the current Humidity!");}
    return parseFloat(RoomHumidity); 
  },
  randomizeHumidity: function() {
    // randomize humidity to a value between 0 and 100
    ROOM_HUMIDITY_SENSOR.CurrentRelativeHumidity = parseFloat(RoomHumidity);;
  }
}

// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:hum152_2');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Hum152_2', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "D2:5D:Z2:AE:5E:F1";
sensor.pincode = "031-45-154";


sensor
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Barabylia") //additional  accessory information
  .setCharacteristic(Characteristic.Model, "DHT22_152_2") //additional  accessory information
  .setCharacteristic(Characteristic.SerialNumber, "000101"); //additional  accessory information

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
   .addService(Service.HumiditySensor, "Hum152_2")
   .getCharacteristic(Characteristic.CurrentRelativeHumidity)
   .on('get', function (callback) {

        // return our current value
   callback(null, ROOM_HUMIDITY_SENSOR.getHumidity());
  });

// randomize our temperature reading every 10 seconds
setInterval(function() {
  
  ROOM_HUMIDITY_SENSOR.randomizeHumidity();

  // update the characteristic value so interested iOS devices can get notified
    sensor
        .getService(Service.HumiditySensor)
        .setCharacteristic(Characteristic.CurrentRelativeHumidity, ROOM_HUMIDITY_SENSOR.CurrentRelativeHumidity);

}, 10000);
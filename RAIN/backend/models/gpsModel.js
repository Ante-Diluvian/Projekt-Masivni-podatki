var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var gpsSchema = new Schema({
  latitude:  [Number],
  longitude: [Number],
  altitude:  [Number]
});

module.exports = mongoose.model('Gps', gpsSchema);

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var gpsSchema = new Schema({
	'latitude' : Number,
	'longitude' : Number,
	'altitude' : Number,
	'timestamp' : {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('gps', gpsSchema);

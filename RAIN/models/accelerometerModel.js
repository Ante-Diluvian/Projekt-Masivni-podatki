var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var accelerometerSchema = new Schema({
	'accel_x' : Number,
	'accel_y' : Number,
	'accel_z' : Number,

	'timestamp' : {
		type: Date,
		default: Date.now
	}
	
});

module.exports = mongoose.model('accelerometer', accelerometerSchema);

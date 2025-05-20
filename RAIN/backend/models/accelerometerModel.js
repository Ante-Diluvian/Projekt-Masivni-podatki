var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var accelerometerSchema = new Schema({
	avgSpeed: {
		type: Number,
		required: true
	  },
	maxSpeed: {
		type: Number,
		required: true
	  }
});

module.exports = mongoose.model('Accelerometer', accelerometerSchema);

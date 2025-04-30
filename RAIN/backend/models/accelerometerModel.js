var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var accelerometerSchema = new Schema({
	avgSpeed: [{
		type: Number,
		required: true
	  }],
	maxSpeed: [{
		type: Number,
		required: true
	  }],

	timestamp : [{
		type: Date,
		default: Date.now
	}],	
	workout : {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Workout'
	}
});

module.exports = mongoose.model('accelerometer', accelerometerSchema);

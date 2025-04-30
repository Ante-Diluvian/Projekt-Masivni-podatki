var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var gpsSchema = new Schema({
	startLatitude : Number,
	startLongitude : Number,
	startAltitude : Number,
	endLatitude : Number,
	endtLongitude : Number,
	startAltitude : Number,
	workout : {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Workout'
	}
});

module.exports = mongoose.model('gps', gpsSchema);

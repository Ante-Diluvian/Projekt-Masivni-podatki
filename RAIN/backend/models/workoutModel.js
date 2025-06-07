var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var workoutSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
	accelerometer : {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Accelerometer'
	},
	gps : {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Gps'
	},
    startTimestamp : {
        type: Date,
        default: Date.now
    },
    endTimestamp : {
        type: Date,
        default: Date.now
    },
    duration : {
        type: Number,
        required: true
    },
    caloriesBurned : {
        type: Number,
        required: true
    },
    distance : {
        type: Number,
        required: true
    }

});

module.exports = mongoose.model('Workout', workoutSchema);

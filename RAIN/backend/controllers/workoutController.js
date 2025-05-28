const WorkoutModel = require('../models/workoutModel.js');


module.exports = {

    list: function (req, res) {
        WorkoutModel.find(function (err, workout) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting workout.',
                    error: err
                });
            }

            return res.json(workout);
        });
    },


    show: function (req, res) {
        var id = req.params.id;

        WorkoutModel.findOne({_id: id}, function (err, workout) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting workout.',
                    error: err
                });
            }

            if (!workout) {
                return res.status(404).json({
                    message: 'No such workout'
                });
            }

            return res.json(workout);
        });
    },

    create: function (req, res) {
        var workout = new WorkoutModel({
			name : req.body.name,
			user_id : req.body.user_id,
			accelerometer : req.body.accelerometer,
			gps : req.body.gps,
            startTimestamp: req.body.startTimestamp,
            endTimestamp: req.body.endTimestamp,
            duration: req.body.duration,
            caloriesBurned: req.body.caloriesBurned,
            distance: req.body.distance,
        });

        workout.save(function (err, workout) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating workout',
                    error: err
                });
            }

            return res.status(201).json(workout);
        });
    },


    update: function (req, res) {
        var id = req.params.id;

        WorkoutModel.findOne({_id: id}, function (err, workout) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting workout',
                    error: err
                });
            }

            if (!workout) {
                return res.status(404).json({
                    message: 'No such workout'
                });
            }

            workout.name = req.body.name ? req.body.name : workout.name;
			workout.user_id = req.body.user_id ? req.body.user_id : workout.user_id;
			workout.accelerometer = req.body.accelerometer ? req.body.accelerometer : workout.accelerometer;
			workout.gps = req.body.gps ? req.body.gps : workout.gps;
            workout.startTimestamp = req.body.startTimestamp ? req.body.startTimestamp : workout.startTimestamp;
            workout.endTimestamp  = req.body.endTimestamp ? req.body.endTimestamp : workout.endTimestamp;
            workout.duration  = req.body.duration ? req.body.duration : workout.duration;
            workout.caloriesBurned  = req.body.caloriesBurned ? req.body.gps : workout.caloriesBurned;
            workout.distance  = req.body.distance ? req.body.distance : workout.distance;
			
            workout.save(function (err, workout) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating workout.',
                        error: err
                    });
                }

                return res.json(workout);
            });
        });
    },


    remove: function (req, res) {
        var id = req.params.id;

        WorkoutModel.findByIdAndRemove(id, function (err, workout) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the workout.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    listByUser: function (req, res) {
        const userId = req.params.userId;
        console.log("Fetching workouts for userId:", userId);

        WorkoutModel.find({ user_id: userId }, function (err, workouts) {
            if (err) {
                console.error("Error finding workouts:", err);
                return res.status(500).json({
                    message: 'Error when getting workouts by user.',
                    error: err
                });
            }

        return res.json(workouts);
    });
}
};

function saveWorkout(data, callback) {
    const workout = new WorkoutModel(data);

    workout.save(function (err, savedWorkout) {
        if (err) {
            console.error("Error saving workout:", err);
        } else {
            console.log("Workout saved successfully");
        }
        if (callback) callback(err, savedWorkout);
    });
};



module.exports.saveWorkout = saveWorkout;
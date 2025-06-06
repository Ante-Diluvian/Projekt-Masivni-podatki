var ExerciseModel = require('../models/exerciseModel');

/**
 * exerciseCotroller.js
 *
 * @description :: Server-side logic for managing exercises.
 */
module.exports = {
    list: function (req, res) {
        ExerciseModel.find(function (err, exercises) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting exercise.',
                    error: err
                });
            }

            return res.json(exercises);
        });
    },

    showCreate: function(req, res){
        res.render('exercises/addExercise');
    },

    create: function (req, res) {
        var exercise = new ExerciseModel({
            name: req.body.name,
            metValue: req.body.metValue,
            imagePath: "/exerciseImages/" + req.file.filename,
            category: req.body.category,
        });

        exercise.save(function (err, exercise) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating exercise',
                    error: err
                });
            }

            return res.status(201).json(exercise);
        });
    },

    update: function (req, res) {
        ExerciseModel.findById(req.params.id, function (err, exercise) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when finding exercise to update',
                    error: err
                });
            }
            if (!exercise) {
                return res.status(404).json({
                    message: 'Exercise not found'
                });
            }

            exercise.name = req.body.name ? req.body.name : exercise.name;
            exercise.metValue = req.body.metValue ? req.body.metValue : exercise.metValue;
            exercise.imagePath = req.body.imagePath ? req.body.imagePath : exercise.imagePath;
            exercise.category = req.body.category ? req.body.category : exercise.category;

            exercise.save(function (err, updatedExercise) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating exercise',
                        error: err
                    });
                }

                return res.json(updatedExercise);
            });
        });
    },

    remove: function (req, res) {
        ExerciseModel.findByIdAndRemove(req.params.id, function (err, exercise) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting exercise',
                    error: err
                });
            }
            if (!exercise) {
                return res.status(404).json({
                    message: 'Exercise not found'
                });
            }

            return res.status(204).send();
        });
    },

    getNames: async function (req, res) {
        try {
            const names = await ExerciseModel.distinct('name');
            res.json(names);
        } catch (err) {
            console.error('Error in getNames:', err);
            res.status(500).json({ message: err.message });
        }
    }
}
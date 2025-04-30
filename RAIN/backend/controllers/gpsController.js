var GpsModel = require('../models/gpsModel.js');

/**
 * gpsController.js
 *
 * @description :: Server-side logic for managing gpss.
 */
module.exports = {

    /**
     * gpsController.list()
     */
    list: function (req, res) {
        GpsModel.find(function (err, gpss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting gps.',
                    error: err
                });
            }

            return res.json(gpss);
        });
    },

    /**
     * gpsController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        GpsModel.findOne({_id: id}, function (err, gps) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting gps.',
                    error: err
                });
            }

            if (!gps) {
                return res.status(404).json({
                    message: 'No such gps'
                });
            }

            return res.json(gps);
        });
    },

    /**
     * gpsController.create()
     */
    create: function (req, res) {
        var gps = new GpsModel({
			latitude : req.body.latitude,
			longitude : req.body.longitude,
			timestamp : req.body.timestamp
        });

        gps.save(function (err, gps) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating gps',
                    error: err
                });
            }

            return res.status(201).json(gps);
        });
    },

    /**
     * gpsController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        GpsModel.findOne({_id: id}, function (err, gps) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting gps',
                    error: err
                });
            }

            if (!gps) {
                return res.status(404).json({
                    message: 'No such gps'
                });
            }

            gps.latitude = req.body.latitude ? req.body.latitude : gps.latitude;
			gps.longitude = req.body.longitude ? req.body.longitude : gps.longitude;
			gps.timestamp = req.body.timestamp ? req.body.timestamp : gps.timestamp;
			
            gps.save(function (err, gps) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating gps.',
                        error: err
                    });
                }

                return res.json(gps);
            });
        });
    },

    /**
     * gpsController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        GpsModel.findByIdAndRemove(id, function (err, gps) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the gps.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};

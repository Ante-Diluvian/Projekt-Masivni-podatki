var express = require('express');
var router = express.Router();
var gpsController = require('../controllers/gpsController.js');

/*
 * GET
 */
router.get('/', gpsController.list);

/*
 * GET
 */
router.get('/:id', gpsController.show);

/*
 * POST
 */
router.post('/', gpsController.create);

/*
 * PUT
 */
router.put('/:id', gpsController.update);

/*
 * DELETE
 */
router.delete('/:id', gpsController.remove);

module.exports = router;

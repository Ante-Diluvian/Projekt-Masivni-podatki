var express = require('express');
var router = express.Router();
var workoutController = require('../controllers/workoutController.js');

/*
 * GET
 */
router.get('/', workoutController.list);
router.get('/workouts/:userId', workoutController.listByUser);

router.get('/:id', workoutController.show);

/*
 * POST
 */
router.post('/', workoutController.create);

/*
 * PUT
 */
router.put('/:id', workoutController.update);

/*
 * DELETE
 */
router.delete('/:id', workoutController.remove);

module.exports = router;

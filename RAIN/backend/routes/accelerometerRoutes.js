var express = require('express');
var router = express.Router();
var accelerometerController = require('../controllers/accelerometerController.js');

/*
 * GET
 */
router.get('/', accelerometerController.list);

/*
 * GET
 */
router.get('/:id', accelerometerController.show);

/*
 * POST
 */
router.post('/', accelerometerController.create);

/*
 * PUT
 */
router.put('/:id', accelerometerController.update);

/*
 * DELETE
 */
router.delete('/:id', accelerometerController.remove);

module.exports = router;

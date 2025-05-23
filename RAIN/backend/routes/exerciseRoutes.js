var express = require('express');
var router = express.Router();
var exerciseController = require('../controllers/exerciseController.js');

//GET Get all exercises
router.get('/', exerciseController.list);

//POST Create new exercise
router.post('/', exerciseController.create);

//PUT Update exercise by id
router.put('/:id', exerciseController.update);

//DELETE Delete exercise by id
router.delete('/:id', exerciseController.remove);

module.exports = router;
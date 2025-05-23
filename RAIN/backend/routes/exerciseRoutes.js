var express = require('express');

var multer = require('multer')
var upload = multer({dest: 'public/exerciseImages/'});

var router = express.Router();
var exerciseController = require('../controllers/exerciseController.js');

//GET Get all exercises
router.get('/', exerciseController.list);

router.get('/create', exerciseController.showCreate);

//POST Create new exercise
router.post('/', upload.single('image'), exerciseController.create);

//PUT Update exercise by id
router.put('/:id', exerciseController.update);

//DELETE Delete exercise by id
router.delete('/:id', exerciseController.remove);

module.exports = router;
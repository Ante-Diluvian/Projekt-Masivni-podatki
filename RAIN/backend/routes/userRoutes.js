var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

/* GET */
router.get('/', userController.list);
router.get('/register', userController.showRegister);
router.get('/login', userController.showLogin);
router.get('/me', userController.me);
router.get('/logout', userController.logout);

router.get('/:id', userController.show);

/* POST */
router.post('/', userController.create);
router.post('/login', userController.login);
router.post('/login2fa', userController.loginOnSite);

router.put('/:id', userController.update);

router.delete('/:id', userController.remove);

module.exports = router;
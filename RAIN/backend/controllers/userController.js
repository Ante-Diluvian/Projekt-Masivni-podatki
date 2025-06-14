var UserModel = require('../models/userModel.js');
var mqttHandler = require('./mqttHandler.js');
/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: function (req, res) {
        var user = new UserModel({
			username : req.body.username,
			password : req.body.password,
			email : req.body.email,
            age : req.body.age,
            weight : req.body.weight,
            height : req.body.height,
            gender : req.body.gender,
            user_type: 0,
            twoFactor: { web: true, mobile: false },
        });

        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            return res.status(201).json(user);
        });
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            if (typeof req.body.twoFactor !== 'undefined') user.twoFactor = req.body.twoFactor;
			
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    showRegister: function(req, res){
        res.render('user/register');
    },

    showLogin: function(req, res){
        res.render('user/login');
    },

    login: function(req, res, next){
        UserModel.authenticate(req.body.username, req.body.password, function(err, user){
            if(err || !user){
                var err = new Error('Wrong username or paassword');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
            return res.json(user);
        });
    },

    logout: function(req, res, next){
        if(req.session){
            req.session.destroy(function(err){
                if(err){
                    return next(err);
                } else {
                    return res.status(201).json({});
                }
            });
        }
    },

    me: function(req, res){
        if(!req.session.userId)
            return res.status(401).json({message: 'Unauthorized'});
        
        UserModel.findById(req.session.userId, function(err, user){
            if(err || !user)
                return res.status(401).json({message: 'Unauthorized'});   
            return res.json(user);
        });
    },

    getUserById: async function (id) {
        try {
            return await User.findById(id);
        } catch (err) {
            console.error("Error fetching user by ID:", err);
            return null;
        }
    },

    loginOnSite: async function(req, res, next) {
        UserModel.authenticate(req.body.username, req.body.password, function(err, user){
            if(err || !user){
                var err = new Error('Wrong username or paassword');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
            console.log("User logged in:", user._id);
            if (!user.twoFactor || user.twoFactor.web === false) {
                console.log("2FA skipped for on-site user:", user._id);
                return res.json(user);
            }
            
            mqttHandler.sendMsg(user._id).then(success => {
                if (success) {
                console.log("Login succsesfuly:", success );
                return res.json(user);
                } else {
                console.error("Failied to login", success);
                return res.status(401).json({ message: '2FA failed' });
                }
            }).catch(err => {
                console.error("2FA error:", err);
                return res.status(500).json({ message: 'Internal 2FA error' });
            });

        });
    },
    register_on_site: function (req, res) {
        var user = new UserModel({
			username : req.body.username,
			password : req.body.password,
			email : req.body.email,
            age : req.body.age,
            weight : req.body.weight,
            height : req.body.height,
            gender : req.body.gender,
            user_type: 0,
            twoFactor: { web: false, mobile: false },
        });

        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            return res.status(201).json(user);
        });
    },
};

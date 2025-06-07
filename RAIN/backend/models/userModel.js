var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	username : String,
	password : String,
	email : String,
	timestamp : {
		type: Date,
		default: Date.now
	},
	age: Number,
	weight: Number,
	height: Number,
	gender: { type: String, enum: ['male', 'female', 'other'] },
	user_type : Number,
	twoFactor: {
		web: { type: Boolean, default: false },
		mobile: { type: Boolean, default: false },
	},
	userEmbedding: {
		type: [Number],
		default: []
	}
});

userSchema.pre('save', function(next){
	var user = this;

	if (!user.isModified('password')) return next();

	bcrypt.hash(user.password, 10, function(err, hash){
		if(err){
			return next(err);
		}
		user.password = hash;
		next();
	});
});

userSchema.statics.authenticate = function(username, password, callback){
	User.findOne({username: username})
	.exec(function(err, user){
		if(err){
			return callback(err);
		} else if(!user) {
			var err = new Error("User not found.");
			err.status = 401;
			return callback(err);
		} 
		bcrypt.compare(password, user.password, function(err, result){
			if(result === true){
				return callback(null, user);
			} else{
				return callback();
			}
		});
		 
	});
}

var User = mongoose.model('User', userSchema);
module.exports = User;
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
	username : String,
	password : String,
	email : String,
	timestamp : {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model('user', userSchema);

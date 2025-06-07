var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

const exerciseSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },  
    metValue: {                     //MET for calculating calories
        type: Number, 
        required: true 
    },            
    imagePath: String,
    category: String,               //cardio, strength itd.
});

module.exports = mongoose.model('Exercise', exerciseSchema);
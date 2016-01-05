var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var validator = require('validator');

var schema = mongoose.Schema({
		name:{type:String, required: true},
		avatar:{type:Number},
		email:{type:String, unique: true, required: true, uniqueCaseInsensitive: true, validate: [validator.isEmail, 'invalid email']},
		series:[{
			tmdbId:{type:Number},
			notification:{type:Boolean}
		}]
});

schema.plugin(uniqueValidator);

module.exports  = mongoose.model('Users', schema);

//TODO : mettre les bons types
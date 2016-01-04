var mongoose = require('mongoose');

var schema = mongoose.Schema({
		name:{type:String},
		avatar:{type:String},
		email:{type:String},
		series:[{
			tmdbId:{type:Number},
			notification:{type:Boolean}
		}]
});

module.exports  = mongoose.model('Users', schema);

//TODO : mettre les bons types
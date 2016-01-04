var mongoose = require('mongoose');

var schema = mongoose.Schema({
		service:{
			id:{type:String},
			name:{type:String},
			url:{type:String},
			category:{type:String},
			description:{type:String}
		},
		account:{
			id:{type:String}
		},
		occurenceId:{type:String},
		login:{type:String},
		APIKey:{type:String},
		password:{type:String},
		endAccounts:[{
			firstName:{type:String},
			lastName:{type:String},
			email:{type:String},
			lastConnexion:{type:String},
			role:{type:String}
		}],
		effectivePrice:{type:String},
		renewalDate:{type:String},
		billingFrequency:{type:String},
		termination:{type:String},
		comments:[{
			content:{type:String}
		}],
		history:[{
			numberMetric:{type:String},
			paidPrice:{type:String},
			date:{type:String}
		}]
});

module.exports  = mongoose.model('Configurations', schema);

//TODO : mettre les bons types
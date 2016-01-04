var mongoose = require('mongoose');

var schema = mongoose.Schema(
	{	
		"name":{type:String},
		"url":{type:String},
		"category":{type:String},
		"description":{type:String},
		"pricing":{"usedMetric":{type:String},
					"frequency":{type:String},
					"packages":[{
								"name":{type:String},
								"price":{type:String},
								"limit":{type:String}
							}]
					}}
	);

module.exports  = mongoose.model('Service', schema);
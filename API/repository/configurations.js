var Configurations = require ('../models/configurations');

function ConfigurationsRepository () {
    "use strict";    

    this.getListConfigurations = function(req, res, next) {
        var query, filter;
        if (typeof req.query.query === 'undefined') {query = {};}
        else {query = JSON.parse(req.query.query);}
        if (typeof req.query.filter === 'undefined') {filter = {};}
        else {filter = JSON.parse(req.query.filter);}

		Configurations.find(query,filter, function(err, configurations) {
		  if (err) throw err;
		  res.json(configurations);
		});
    }

    this.getConfigurationById= function(req, res, next) {
        Configurations.find({'_id':req.params.id}, function(err, configurations) {
          if (err) throw err;
          res.json(configurations[0]);
        });
    }

    this.postSearchConfiguration= function(req, res, next) {
        console.log(req.body.query);
        console.log(req.body.filter);
        var query, filter;
        Configurations.find(req.body.query,req.body.filter, function(err, configurations) {
          if (err) throw err;
          res.json(configurations);
        });

    }

    this.postConfigurations = function(req, res, next) {
        console.log(req.body);
        var newConfiguration = new Configurations(req.body);
        newConfiguration.save(function (err, newService){
        	if (err) throw err;
            res.json({'message': 'success'});
        });
        return;
    }
}

module.exports = ConfigurationsRepository;

//Repository
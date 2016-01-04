var Service = require ('../models/services');

function ServicesRepository () {
    "use strict";    

    this.getListServices = function(req, res, next) {
        if (typeof req.query.query === 'undefined') {query = {};}
        else {query = JSON.parse(req.query.query);}
        if (typeof req.query.filter === 'undefined') {filter = {};}
        else {filter = JSON.parse(req.query.filter);}

		Service.find(query,filter, function(err, services) {
		  if (err) throw err;
		  res.json(services);
		});
    }

    this.postService = function(req, res, next) {
        console.log(req.body);

        var newService = new Service(req.body);
        newService.save(function (err, newService){
        	if (err) throw err;
        });
        res.json({'message': 'success'});
        return;
    }
}

module.exports = ServicesRepository;

//Repository
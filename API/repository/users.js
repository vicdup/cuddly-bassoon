var Users = require ('../models/users');

function ConfigurationsRepository () {
    "use strict";    

    this.getUsers = function(req, res, next) {
        var query, filter;
        if (typeof req.query.query === 'undefined') {query = {};}
        else {query = JSON.parse(req.query.query);}
        if (typeof req.query.filter === 'undefined') {filter = {};}
        else {filter = JSON.parse(req.query.filter);}

		Users.find(query,filter, function(err, configurations) {
		  if (err) throw err;
		  res.json(configurations);
		});
    }

    this.postUsers = function(req, res, next) {
        console.log(req.body);
        var newUser = new Users(req.body);
        newUser.save(function (err, newService){
        	if (err) throw err;
            res.json({'message': 'success'});
        });
        return;
    }
}

module.exports = ConfigurationsRepository;

//Repository
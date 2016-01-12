var Users = require ('../models/users');

function UsersRepository () {
    "use strict";    

    this.getUsers = function(req, res, next) {
        var query, filter;
        if (typeof req.query.query === 'undefined') {query = {};}
        else {query = JSON.parse(req.query.query);}
        if (typeof req.query.filter === 'undefined') {filter = {};}
        else {filter = JSON.parse(req.query.filter);}

		Users.find(query,filter, function(err, configurations) {
		  if (err){
            throw err;
        }
		  res.json(configurations);
		});
    }

    this.postUsers = function(req, res, next) {
        console.log(req.body);
        var newUser = new Users(req.body);
        newUser.save(function (err, newService){
            if(err){
        	if (err.name == 'ValidationError') {
                res.statusCode = 400;
                res.json(err.errors);
            }
            else throw err;}
            else res.json({'message': 'success'});
        });
        return;
    }

    this.getUserByEmail= function(req, res, next) {
        Users.find({'email':req.params.email}, function(err, users) {
          if (err) throw err;
          res.json(users[0]);
        });
    }

    this.deleteUserByEmail= function(req, res, next) {
        Users.remove({'email':req.params.email}, function(err) {
            if (err) throw err;
            else res.json({'message': 'successly removed'});
        });
    }

    this.putUserByEmail= function(req, res, next) {
        var users = {'email':req.params.email}
          , update = req.body
          , options = { multi: false };

        Users.update(conditions, update, options, function(err, configurations) {
          if (err) throw err;
          res.json(req.body);
        });
    }

}

module.exports = UsersRepository;

//Repository
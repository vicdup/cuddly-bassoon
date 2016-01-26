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
        var conditions = {'email':req.params.email}
          , update = req.body
          , options = { multi: false };

        Users.update(conditions, update, options, function(err, configurations) {
          if (err) throw err;
          res.json(req.body);
        });
    }

    this.postSeriesByEmailOfUsers = function(req, res, next) {
        console.log(req.body);
        var conditions = {'email':req.params.email}
        Users.update(conditions,
            {$push: {"series": {tmdbId: req.body.tmdbId, notification:req.body.notification}}},
            {safe: true, upsert: true},
            function(err, model) {
                if (err) throw err;
                else res.json({'message': 'successly added serie'});
            });
    }

    this.deleteSeriesByEmailOfUsers = function(req, res, next) {
        console.log(req.body);
        var conditions = {'email':req.params.email}
        Users.update(conditions,
            {$pull: {"series": {tmdbId: req.params.tmdbId}}},
            {safe: true, upsert: true},
            function(err, model) {
                if (err) throw err;
                else res.json({'message': 'successly deleted serie'});
            });
    }


    // this.putUsersByEmailSeries= function(req, res, next) {
    //     Users.findOneAndUpdate(
    //         {'email':req.params.email},
    //         {$push: {series: req.body}},
    //         {safe: true, upsert: true},
    //         function(err, model) {
    //             console.log(err);
    //         }
    //     );
    // }

}

module.exports = UsersRepository;

//Repository
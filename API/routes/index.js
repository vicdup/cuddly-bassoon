var express = require('express');
var router = express.Router();

var ServicesHandler = require('../repository/users')
var ConfigurationsHandler = require('../repository/users')

var servicesHandler = new ServicesHandler();
var configurationsHandler = new ConfigurationsHandler();


router.get('/users', servicesHandler.getUsers); //localhost:3000/API/users
router.post('/users', servicesHandler.postUsers);

module.exports = router;
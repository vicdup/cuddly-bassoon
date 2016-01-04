var express = require('express');
var router = express.Router();

var ServicesHandler = require('../repository/services')
var ConfigurationsHandler = require('../repository/configurations')

var servicesHandler = new ServicesHandler();
var configurationsHandler = new ConfigurationsHandler();


router.get('/services', servicesHandler.getListServices); //localhost:3000/API/services
router.post('/services', servicesHandler.postService);

router.get('/configurations', configurationsHandler.getListConfigurations);
router.post('/configurations/search', configurationsHandler.postSearchConfiguration);
router.get('/configurations/:id', configurationsHandler.getConfigurationById);
router.post('/configurations', configurationsHandler.postConfigurations);

module.exports = router;
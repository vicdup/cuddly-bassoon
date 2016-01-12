var express = require('express');
var router = express.Router();

var UsersHandler = require('../repository/users')

var userHandler = new UsersHandler();


router.get('/users', userHandler.getUsers); //localhost:3000/API/users
router.post('/users', userHandler.postUsers);
router.get('/users/:email', userHandler.getUserByEmail);
router.put('/users/:email', userHandler.putUserByEmail);
router.delete('/users/:email', userHandler.deleteUserByEmail);


module.exports = router;
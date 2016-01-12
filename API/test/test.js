var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var winston = require('winston');

describe('API testing', function() {
  var url = 'http://localhost:3000';

  before(function(done) {
    mongoose.connect('mongodb://localhost');							
    done(); 
  });
  time = Date.now();
  describe('POST', function() {
    

    it('should successfully save new user', function(done) {
      var profile = {
        name: 'Victor',
        avatar: 2,
        email: time +'@test.com'
      };

    request(url)
  .post('/API/users')
  .send(profile)

  .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.status.should.be.equal(200);
          done();
        });
    });

    it('should return error trying to save duplicate email', function(done) {
      var profile = {
        name: 'Victor',
        avatar: 2,
        email: 'vicdup@gmail.com'
      };

    request(url)
  .post('/API/users')
  .send(profile)

  .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.status.should.be.equal(400);
          done();
        });
    });

    it('should return error email incorrect', function(done) {
      var profile = {
        name: 'Victor',
        avatar: 2,
        email: 'vicdupmail.com'
      };

    request(url)
  .post('/API/users')
  .send(profile)

  .end(function(err, res) {
          if (err) {
            throw err;
          }
          res.status.should.be.equal(400);
          res.body.email.message.should.be.equal('invalid email');
          done();
        });
    });
  });
  newTime = Date.now();
  describe('PUT', function() {
    it('should correctly update an existing user', function(done){
  var body = {
    name: newTime
  };
  request(url)
    .put('/api/users/'+time+'@test.com')
    .send(body)
    .expect('Content-Type', /json/)
    .expect(200) //Status code
    .end(function(err,res) {
      if (err) {
        throw err;
      }
      // Should.js fluent syntax applied
        res.body.name.should.equal(newTime);
      done();
    });
  });
  });

  describe('GET', function() {
    it('should get an array', function(done){

  request(url)
    .get('/API/users')
    .expect('Content-Type', /json/)
    .expect(200) //Status code
    .end(function(err,res) {
      if (err) {
        throw err;
      }
      // Should.js fluent syntax applied
      res.body.should.be.instanceof(Array)
      done();
    });
  });
  });

  describe('DELETE', function() {
    it('should correctly delete an existing user', function(done){
  request(url)
    .delete('/api/users/'+time+'@test.com')
    .send()
    .expect('Content-Type', /json/)
    .expect(200) //Status code
    .end(function(err,res) {
      if (err) {
        throw err;
      }
      done();
    });
  });
  });
});
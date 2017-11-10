'use strict';

const app = require('../app');
const chai = require('chai');
const request = require('supertest');
const expect = chai.expect;
const chaiJsonEqual = require('chai-json-equal');
const chaiJsonSchema = require('chai-json-schema');
chai.use(chaiJsonEqual);
chai.use(chaiJsonSchema);

describe('Authorization API Integration Tests', function() {
    
    describe('#POST /api/v1/auth/register', function() { 
        it('user register should fail timezone error', function(done) { 
          request(app)
              .post('/api/v1/auth/register')
              .send({
                  email: 'gkravas@dispostable.com',
                  password: '123456',
                  birthDate: '1984-08-16 21:30:00',
                  birthLocation: 'asdqwqwx',
                  type: 'male'
              })
              .end(function(err, res) { 
                  expect(res.statusCode).to.equal(400); 
                  expect(res.body).to.be.jsonEqual({
                      "error": {
                          "type": "timezone error",
                          "name": "ExternalServiceError",
                          "message": "timezone not found"
                        }
                    }); 
                  done(); 
              }); 
        });
    });

    describe('#POST /api/v1/auth/register', function() { 
        it('user register should fail invalid date format', function(done) { 
          request(app)
              .post('/api/v1/auth/register')
              .send({
                  email: 'gkravas@dispostable.com',
                  password: '123456',
                  birthDate: '1984-08-16',
                  birthLocation: 'thessaloniki',
                  type: 'male'
              })
              .end(function(err, res) { 
                  expect(res.statusCode).to.equal(400); 
                  expect(res.body).to.be.jsonEqual({
                      "error": {
                          "name": "ServiceError",
                          "type": "format violation",
                          "message": "Wrong date format should be 'YYYY-MM-DD HH:mm:ss'",
                          "field":"birthDate"
                        }
                    }); 
                  done(); 
              }); 
        });
    });

    describe('#POST /api/v1/auth/register', function() { 
        it('user register should fail invalid date format', function(done) { 
          request(app)
              .post('/api/v1/auth/register')
              .send({
                  email: 'gkravas@dispostable.com',
                  password: '123456',
                  birthDate: '1984-08-16 21:30:00',
                  birthLocation: 'thessaloniki',
                  type: 'dsadsadsa'
              })
              .end(function(err, res) { 
                  expect(res.statusCode).to.equal(400); 
                  expect(res.body).to.be.jsonEqual({
                      "error": {
                          "name": "ServiceError",
                          "type": "Validation error",
                          "message": "Validation isIn on type failed",
                          "field":"type"
                        }
                    }); 
                  done(); 
              }); 
        });
    });

    describe('#POST /api/v1/auth/register', function() { 
      it('user register should succeed', function(done) { 
        request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'gkravas@dispostable.com',
                password: '123456',
                birthDate: '1984-08-16 21:30:00',
                birthLocation: 'thessaloniki',
                type: 'male'
            })
            .end(function(err, res) { 
                expect(res.statusCode).to.equal(201); 
                expect(res.body).to.be.empty; 
                done(); 
            }); 
      });
    });

    describe('#POST /api/v1/auth/register', function() { 
        it('user register should fail duplicate email', function(done) { 
          request(app)
              .post('/api/v1/auth/register')
              .send({
                  email: 'gkravas@dispostable.com',
                  password: '123456',
                  birthDate: '1984-08-16 21:30:00',
                  birthLocation: 'thessaloniki',
                  type: 'male'
              })
              .end(function(err, res) { 
                  expect(res.statusCode).to.equal(400); 
                  expect(res.body).to.be.jsonEqual({
                      "error": {
                          "type":"unique violation",
                          "field":"email",
                          "message": "email must be unique",
                          "name":"ServiceError"
                        }
                    }); 
                  done(); 
              }); 
        });
      });

      describe('#POST /api/v1/auth/login', function() { 
        it('user login should fail', function(done) { 
          request(app)
              .post('/api/v1/auth/login')
              .send({
                  email: 'gkravas@dispostable.com',
                  password: '1234567'
              })
              .end(function(err, res) { 
                  expect(res.statusCode).to.equal(401); 
                  done(); 
              }); 
        });
      });

      describe('#POST /api/v1/auth/login', function() { 
        it('user login should succeed', function(done) { 
          request(app)
              .post('/api/v1/auth/login')
              .send({
                  email: 'gkravas@dispostable.com',
                  password: '123456'
              })
              .end(function(err, res) { 
                  expect(res.statusCode).to.equal(200); 
                  expect(res.body).to.be.jsonSchema({
                    title: 'login user schema',
                    type: 'object',
                    required: ['apps', 'user', 'token'],
                    properties: {
                        apps: {
                            type: 'object',
                            required: ['android', 'iOS'],
                            android: {
                                type: 'string'
                            },
                            iOS: {
                                type: 'string'
                            },
                        },
                        token: {
                            type: 'string'
                        },
                        user: {
                            type: 'object',
                            required: ['email', 'id'],
                            properties: {
                                email: {
                                    type: 'string'
                                },
                                id: {
                                    type: 'number'
                                }
                            }
                        }
                    }
                  }); 
                  done(); 
              }); 
        });
      });
  });
'use strict';

const app = require('../dist/app');
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
        it('user register should fail invalid user type', function(done) { 
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
                password: "1s='w9<)S\\",
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
      
      describe('#POST /api/v1/auth/fbLogin', function() { 
        it('user fbLogin should succeed', function(done) { 
          request(app)
              .post('/api/v1/auth/fbLogin')
              .send({
                  fbToken: 'EAAYwQZBMrtlUBAOMrsFr1sMVaAJTpthHVpyDnZA48j1hOdkYv4RsKZBfIDkN9YYYZAxFcs2wDUmMj8SxtfKHJtdw6egnl2tbE0YWibYBjhDQXRTQ4dyx5R6Iim8YRiYsMmyYia1Pp5IQuYFII5zeXtnGGw7udXC4WzH3IDItsQ4y4OebUwLrF5pZAY5gAU8mdcq0EfAl4tqanGgAqAaUwtLumeCXjghr1ZAwGo0bppkQZDZD',
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
      /*
      describe('#POST /api/v1/auth/fbLogin', function() { 
        it('user fbLogin should fail no email permission giver', function(done) { 
          request(app)
              .post('/api/v1/auth/fbLogin')
              .send({
                  fbToken: 'EAAYwQZBMrtlUBAHp3LlYp1N3IfXuS9HICiZA4O3T6sJ9jqdkIHsERCkrhKXokJP7ER2B4MQMTjVoOfbMGdZCvhcGXnetAvpPE8z5mAlbjXknEZAbn9eeTL1P0ZAQbeGHUguRCZACHEjCHmPwZBApimCZAuGmm8k90ZCs0Uxo5DmBG8GeqnxiZBjUMoFtrZCq6VurtZBlLyNPdrQ1B4pPWmdrKZCaw5ZALVVyl0SzTFiXwd0hr3QwZDZD',
              })
              .end(function(err, res) { 
                expect(res.statusCode).to.equal(400); 
                expect(res.body).to.be.jsonEqual({
                    "error": {
                        "type":"notNull Violation",
                        "field":"email",
                        "message": "email cannot be null",
                        "name":"ServiceError"
                      }
                  }); 
                done(); 
              }); 
        });
      });*/
  });
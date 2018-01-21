'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Volatility = mongoose.model('Volatility'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  volatility;

/**
 * Volatility routes tests
 */
describe('Volatility CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Volatility
    user.save(function () {
      volatility = {
        name: 'Volatility name'
      };

      done();
    });
  });

  it('should be able to save a Volatility if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Volatility
        agent.post('/api/volatilities')
          .send(volatility)
          .expect(200)
          .end(function (volatilitySaveErr, volatilitySaveRes) {
            // Handle Volatility save error
            if (volatilitySaveErr) {
              return done(volatilitySaveErr);
            }

            // Get a list of Volatilities
            agent.get('/api/volatilities')
              .end(function (volatilitiesGetErr, volatilitiesGetRes) {
                // Handle Volatilities save error
                if (volatilitiesGetErr) {
                  return done(volatilitiesGetErr);
                }

                // Get Volatilities list
                var volatilities = volatilitiesGetRes.body;

                // Set assertions
                (volatilities[0].user._id).should.equal(userId);
                (volatilities[0].name).should.match('Volatility name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Volatility if not logged in', function (done) {
    agent.post('/api/volatilities')
      .send(volatility)
      .expect(403)
      .end(function (volatilitySaveErr, volatilitySaveRes) {
        // Call the assertion callback
        done(volatilitySaveErr);
      });
  });

  it('should not be able to save an Volatility if no name is provided', function (done) {
    // Invalidate name field
    volatility.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Volatility
        agent.post('/api/volatilities')
          .send(volatility)
          .expect(400)
          .end(function (volatilitySaveErr, volatilitySaveRes) {
            // Set message assertion
            (volatilitySaveRes.body.message).should.match('Please fill Volatility name');

            // Handle Volatility save error
            done(volatilitySaveErr);
          });
      });
  });

  it('should be able to update an Volatility if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Volatility
        agent.post('/api/volatilities')
          .send(volatility)
          .expect(200)
          .end(function (volatilitySaveErr, volatilitySaveRes) {
            // Handle Volatility save error
            if (volatilitySaveErr) {
              return done(volatilitySaveErr);
            }

            // Update Volatility name
            volatility.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Volatility
            agent.put('/api/volatilities/' + volatilitySaveRes.body._id)
              .send(volatility)
              .expect(200)
              .end(function (volatilityUpdateErr, volatilityUpdateRes) {
                // Handle Volatility update error
                if (volatilityUpdateErr) {
                  return done(volatilityUpdateErr);
                }

                // Set assertions
                (volatilityUpdateRes.body._id).should.equal(volatilitySaveRes.body._id);
                (volatilityUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Volatilities if not signed in', function (done) {
    // Create new Volatility model instance
    var volatilityObj = new Volatility(volatility);

    // Save the volatility
    volatilityObj.save(function () {
      // Request Volatilities
      request(app).get('/api/volatilities')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Volatility if not signed in', function (done) {
    // Create new Volatility model instance
    var volatilityObj = new Volatility(volatility);

    // Save the Volatility
    volatilityObj.save(function () {
      request(app).get('/api/volatilities/' + volatilityObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', volatility.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Volatility with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/volatilities/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Volatility is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Volatility which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Volatility
    request(app).get('/api/volatilities/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Volatility with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Volatility if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Volatility
        agent.post('/api/volatilities')
          .send(volatility)
          .expect(200)
          .end(function (volatilitySaveErr, volatilitySaveRes) {
            // Handle Volatility save error
            if (volatilitySaveErr) {
              return done(volatilitySaveErr);
            }

            // Delete an existing Volatility
            agent.delete('/api/volatilities/' + volatilitySaveRes.body._id)
              .send(volatility)
              .expect(200)
              .end(function (volatilityDeleteErr, volatilityDeleteRes) {
                // Handle volatility error error
                if (volatilityDeleteErr) {
                  return done(volatilityDeleteErr);
                }

                // Set assertions
                (volatilityDeleteRes.body._id).should.equal(volatilitySaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Volatility if not signed in', function (done) {
    // Set Volatility user
    volatility.user = user;

    // Create new Volatility model instance
    var volatilityObj = new Volatility(volatility);

    // Save the Volatility
    volatilityObj.save(function () {
      // Try deleting Volatility
      request(app).delete('/api/volatilities/' + volatilityObj._id)
        .expect(403)
        .end(function (volatilityDeleteErr, volatilityDeleteRes) {
          // Set message assertion
          (volatilityDeleteRes.body.message).should.match('User is not authorized');

          // Handle Volatility error error
          done(volatilityDeleteErr);
        });

    });
  });

  it('should be able to get a single Volatility that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Volatility
          agent.post('/api/volatilities')
            .send(volatility)
            .expect(200)
            .end(function (volatilitySaveErr, volatilitySaveRes) {
              // Handle Volatility save error
              if (volatilitySaveErr) {
                return done(volatilitySaveErr);
              }

              // Set assertions on new Volatility
              (volatilitySaveRes.body.name).should.equal(volatility.name);
              should.exist(volatilitySaveRes.body.user);
              should.equal(volatilitySaveRes.body.user._id, orphanId);

              // force the Volatility to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Volatility
                    agent.get('/api/volatilities/' + volatilitySaveRes.body._id)
                      .expect(200)
                      .end(function (volatilityInfoErr, volatilityInfoRes) {
                        // Handle Volatility error
                        if (volatilityInfoErr) {
                          return done(volatilityInfoErr);
                        }

                        // Set assertions
                        (volatilityInfoRes.body._id).should.equal(volatilitySaveRes.body._id);
                        (volatilityInfoRes.body.name).should.equal(volatility.name);
                        should.equal(volatilityInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Volatility.remove().exec(done);
    });
  });
});

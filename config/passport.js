/*
 Copyright 2016, 2017 Richard Nesnass and Jeremy Toussaint

 This file is part of Talkwall.

 Talkwall is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Talkwall is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Talkwall.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var FacebookStrategy =  require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalAPIKeyStrategy = require('passport-localapikey-es6').Strategy;

// load up the user model
var User  = require('../models/user');

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // LOCAL ================================================================

    passport.use(new LocalAPIKeyStrategy(
        function(apikey, done) {
            User.findOne({ 'local.apikey' : apikey }, function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                return done(null, user);
            });
        }
    ));

    // FACEBOOK ================================================================
    passport.use(new FacebookStrategy({

            // pull in our app id and secret from our auth.js file
            clientID        : process.env.FACEBOOK_APP_ID,
            clientSecret    : process.env.FACEBOOK_APP_SECRET,
            callbackURL     : process.env.FACEBOOK_CALLBACK,
            profileFields:  ['id', 'name', 'emails']

        },

        // facebook will send back the token and profile
        function(token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // find the user in the database based on their facebook id
                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        user.lastLogin = Date.now;
                        // Check that facebook details are included
                        if (typeof user.facebook.email === 'undefined' || user.facebook.email === null ) {
                            if(typeof profile.name.givenName === 'undefined' && typeof profile.name.familyName === 'undefined') {
                                user.facebook.name = profile.displayName;
                            }
                            else {
                                user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                            }
                            if(profile.emails !== undefined) {
                                user.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                                user.defaultEmail = user.facebook.email;
                            }
                        }
                        user.save();

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser = new User();

                        // set all of the facebook information in our user model
                        newUser.facebook.id    = profile.id; // set the users facebook id
                        newUser.facebook.token = token; // we will save the token that facebook provides to the user
                        
                        if(typeof profile.name.givenName === 'undefined' && typeof profile.name.familyName === 'undefined') {
                            newUser.facebook.name = profile.displayName;
                        }
                        else {
                            newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        }
                        
                        if(profile.emails !== undefined) {
                            newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                            newUser.defaultEmail = user.facebook.email;
                        }
                        
                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });

        }));

    // GOOGLE ================================================================
    passport.use(new GoogleStrategy({
            clientID        : process.env.GOOGLE_APP_ID,
            clientSecret    : process.env.GOOGLE_APP_SECRET,
            callbackURL     : process.env.GOOGLE_CALLBACK
        },
        function (accessToken, refreshToken, profile, done) {
            /*User.findOrCreate({ googleId: profile.id }, function (err, user) {
             return done(err, user);
             });*/

            // asynchronous
            process.nextTick(function() {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {

                    // if there is an error, stop everything and return that
                    // ie an error connecting to the database
                    if (err)
                        return done(err);

                    // if the user is found, then log them in
                    if (user) {
                        user.lastLogin = Date.now;
                        user.save();

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user found with that facebook id, create them
                        var newUser            = new User();

                        // set all of the facebook information in our user model
                        newUser.google.id       = profile.id; // set the users facebook id
                        newUser.google.token    = accessToken; // we will save the token that google provides to the user
                        newUser.google.name     = profile.displayName; // look at the passport user profile to see how names are returned
                        newUser.google.email    = profile.emails[0].value; // google can return multiple emails so we'll take the first
                        newUser.defaultEmail    = newUser.google.email;

                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;

                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });
            });

            // find the user in the database based on their facebook id
        }));
};

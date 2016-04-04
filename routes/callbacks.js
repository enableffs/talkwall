/**
 * Created by jeremyt on 10/10/14.
 */
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
var tokenManager = require('../config/token_manager');
var User = require('../models/users');
var Pin = require('../models/pins');

exports.fbcallback = function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    var token = jwt.sign({id: req.user._id}, secret.secretToken, { expiresInMinutes: tokenManager.TOKEN_EXPIRATION });

    var userquery = User.findOne({_id: req.user._id});
    userquery.exec(function (err, user) {
        if (err) {
            return res.status(400).end();
        }

        if (user != null) {
            console.log('--> user search - got results');

            user.defaultEmail = user.facebook.email;
            user.save(function(error, result, index) {
                if (error) {
                    console.log(err);
                    return res.status(400).json({message: 'error saving user'});
                }

                //return res.redirect('/#/create?t='+token+'&u='+user._id+'&s='+user.lastPin+'&e='+user.facebook.email+'&h='+user.helpViewed);
                return res.redirect('/');
            });

        } else {
            return res.status(404).json({message: 'empty user'});
        }
    });
};

exports.googlecallback = function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    var token = jwt.sign({id: req.user._id}, secret.secretToken, { expiresInMinutes: tokenManager.TOKEN_EXPIRATION });

    var userquery = User.findOne({_id: req.user._id});
    userquery.exec(function (err, user) {
        if (err) {
            return res.status(400).end();
        }

        if (user != null) {
            console.log('--> user search - got results');

            user.defaultEmail = user.google.email;
            user.save(function(error, result, index) {
                if (error) {
                    console.log(err);
                    return res.status(400).json({message: 'error saving user'});
                }

                //return res.redirect('/#/create?t='+token+'&u='+user._id+'&s='+user.lastPin+'&e='+user.google.email+'&h='+user.helpViewed);
                return res.redirect('/');
            });

        } else {
            return res.status(404).json({message: 'empty user'});
        }
    });
};
/**
 * Created by jeremyt on 10/10/14.
 */
var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
var tokenManager = require('../config/token_manager');
var User = require('../models/user');
var common = require('../config/common.js');

exports.localapicallback = function(req, res) {
    var token = jwt.sign({id: req.user._id}, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION});

    return res.status(common.StatusMessages.LOGIN_SUCCESS.status).json({
        message: common.StatusMessages.LOGIN_SUCCESS.message, token: token
    });
};


exports.fbcallback = function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    var token = jwt.sign({id: req.user._id}, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION});

    var userquery = User.findOne({_id: req.user._id});
    userquery.exec(function (err, user) {
        if (err) {
            return res.status(common.StatusMessages.DATABASE_ERROR.status).json({message: common.StatusMessages.DATABASE_ERROR.message, error: err});
        }

        if (user != null) {
            console.log('--> user search - got results');

            user.defaultEmail = user.facebook.email;
            user.save(function(error, newUser) {
                if (error) {
                    return res.status(common.StatusMessages.DATABASE_ERROR.status).json({message: common.StatusMessages.DATABASE_ERROR.message, error: error});
                }

                return res.redirect('/#/wall?authenticationToken='+token);
                //return res.status(common.StatusMessages.LOGIN_SUCCESS.status).json({message: common.StatusMessages.LOGIN_SUCCESS.message, user: newUser, token: token});
            });

        } else {
            return res.status(common.StatusMessages.INVALID_USER.status).json({message: common.StatusMessages.INVALID_USER.message});
        }
    });
};

exports.googlecallback = function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    var token = jwt.sign({id: req.user._id}, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION});

    var userquery = User.findOne({_id: req.user._id});
    userquery.exec(function (err, user) {
        if (err) {
            return res.status(common.StatusMessages.DATABASE_ERROR.status).json({message: common.StatusMessages.DATABASE_ERROR.message, error: err});
        }

        if (user != null) {
            console.log('--> user search - got results');

            user.defaultEmail = user.google.email;
            user.save(function(error, newUser) {
                if (error) {
                    return res.status(common.StatusMessages.DATABASE_ERROR.status).json({message: common.StatusMessages.DATABASE_ERROR.message, error: error});
                }

                return res.redirect('/#/wall?authenticationToken='+token);
                //return res.status(common.StatusMessages.LOGIN_SUCCESS.status).json({message: common.StatusMessages.LOGIN_SUCCESS.message, user: newUser, token: token});
            });

        } else {
            return res.status(common.StatusMessages.INVALID_USER.status).json({message: common.StatusMessages.INVALID_USER.message});
        }
    });
};

exports.logout = function(req, res) {
    if (req.user) {
        tokenManager.expireToken(req.headers);

        delete req.user;
        return res.status(common.StatusMessages.USER_LOGOUT_SUCCESS.status).json({message: common.StatusMessages.USER_LOGOUT_SUCCESS.message});
    }
    else {
        return res.status(common.StatusMessages.USER_LOGOUT_ERROR.status).json({message: common.StatusMessages.USER_LOGOUT_ERROR.message});
    }
};
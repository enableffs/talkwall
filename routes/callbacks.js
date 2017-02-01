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

                return res.redirect('/#/organiser?authenticationToken='+token);
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

                return res.redirect('/#/organiser?authenticationToken='+token);
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
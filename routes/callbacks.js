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

var jwt = require('jsonwebtoken');
var secret = require('../config/secret');
var tokenManager = require('../config/token_manager');
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
    return res.redirect('/#/organiser?authenticationToken='+token);
};

exports.googlecallback = function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    var token = jwt.sign({id: req.user._id}, secret.secretToken, {expiresIn: tokenManager.TOKEN_EXPIRATION});
    return res.redirect('/#/organiser?authenticationToken='+token);
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
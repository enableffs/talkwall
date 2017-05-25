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

var redisClient = require('./redis_database').redisClient;
var TOKEN_EXPIRATION = 86400; //24hrs
var TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION * 60;

// Middleware for token verification
exports.verifyToken = function (req, res, next) {
	var token = getToken(req.headers);

	redisClient.get(token, function (err, reply) {
		if (err) {
			console.log(err);
			return res.send(500);
		}

		if (reply) {
			res.send(401);
		}
		else {
			next();
		}

	});
};

exports.expireToken = function(headers) {
	var token = getToken(headers);
	
	if (token != null) {
		redisClient.set(token, { is_expired: true });
    	redisClient.EXPIRE(token, TOKEN_EXPIRATION_SEC);
	}
};

var getToken = function(headers) {
	if (headers && headers.authorization) {
		var authorization = headers.authorization;
		var part = authorization.split(' ');

		if (part.length == 2) {
			var token = part[1];

			return part[1];
		}
		else {
			return null;
		}
	}
	else {
		return null;
	}
};

exports.TOKEN_EXPIRATION = TOKEN_EXPIRATION;
exports.TOKEN_EXPIRATION_SEC = TOKEN_EXPIRATION_SEC;
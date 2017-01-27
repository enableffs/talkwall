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

//this url comes from the heroku (dev) config - no need to run local redis service
var rtg, redisclient;
if (process.env.REDISTOGO_URL) {
    rtg = require("url").parse(process.env.REDISTOGO_URL);
    redisclient = require('redis').createClient(rtg.port, rtg.hostname);
    redisclient.auth(rtg.auth.split(":")[1]);
} else {
    redisclient = require('redis').createClient();
}

//var redisClient = require('redis').createClient(rtg.port, rtg.hostname);
//redisClient.auth(rtg.auth.split(':')[1]);

redisclient.on('connect', function () {
    console.log('Redis is ready');
});

exports.redisClient = redisclient;
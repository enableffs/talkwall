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
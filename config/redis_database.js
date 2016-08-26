'use strict';

var redis = require('redis');

//this url comes from the heroku (dev) config - no need to run local redis service
var rtg;
if (process.env.REDISTOGO_URL) {
    rtg = require('url').parse(process.env.REDISTOGO_URL);
}

var redisClient = require('redis').createClient(rtg.port, rtg.hostname);
redisClient.auth(rtg.auth.split(':')[1]);

redisClient.on('connect', function () {
    console.log('Redis is ready');
});

exports.redis = redis;
exports.redisClient = redisClient;
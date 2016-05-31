/*
 *
 * Main App file App.js
 * @author Jeremy Toussaint
 *
 *
 */

/********* load environment variables locally *********/
var dotenv = require('dotenv');
dotenv.load();

/********* port config for heroku deploy *********/
var port = process.env.PORT;

/********* loading modules and plugins *********/
var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var morgan = require('morgan');
var Promise = require('promise');
var jwt = require('express-jwt');
var bodyParser = require('body-parser');
var tokenManager = require('./config/token_manager');
var secret = require('./config/secret');
var methodOverride = require('method-override');
var passport = require('passport');
require('./config/passport')(passport);
var path = require('path');
var utilities = require('./config/utilities');
var app = express();

/********* route includes *********/
var routes = {};
routes.callbacks =  require('./routes/callbacks.js');
routes.sync = require('./routes/sync.js');
routes.client = require('./routes/client');

/********* db connection *********/
var mongodbURL = process.env.MONGOLAB_URI;
var mongodbOptions = {};
mongoose.connect(mongodbURL, mongodbOptions);
var db = mongoose.connection;
db.on('error', function (err) {
    console.log('Mongo error from app.js '+err);
    utilities.processError(err);
});

/********* redis connection handler *********/
var redisC = require('./config/redis_database');
redisC.redisClient.on('error', function (err) {
    console.log('Redis error from app.js' + err);
    utilities.processError(err);
});

/********* app configuration *********/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(morgan('dev'));
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, process.env.STATIC_FOLDER)));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.all('*', function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Credentials', true);
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');
    if ('OPTIONS' == req.method) return res.status(200).end();
    next();
});

/********* start the server *********/
app.listen(port);
console.log('--> samtavla-services listening on port: '+port);

/********* callback *********/
app.get('/auth/facebook',           passport.authenticate('facebook',   { scope : 'email' }));
app.get('/auth/facebook/callback',  passport.authenticate('facebook'),  routes.callbacks.fbcallback);

app.get('/auth/google',             passport.authenticate('google',     { scope: 'email' }));
app.get('/auth/google/callback',    passport.authenticate('google'),    routes.callbacks.googlecallback);

app.put('/poll',                                                        routes.client.poll);
app.put('/connect',                                                     routes.client.connect);

/********* sync *********/
app.get('/ping',                                                    routes.sync.ping());
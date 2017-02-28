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

//require('newrelic');

/********* load environment variables locally *********/
require('dotenv').config({ silent: process.env.NODE_ENV === 'production' });

/********* port config for heroku deploy *********/
var port = process.env.PORT;

/********* loading modules and plugins *********/
var toobusy = require('toobusy-js');
var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var morgan = require('morgan');
mongoose.Promise = require('q').Promise;
var jwt = require('express-jwt');
var bodyParser = require('body-parser');
var tokenManager = require('./config/token_manager');
var secret = require('./config/secret');
var passport = require('passport');
require('./config/passport')(passport);
var path = require('path');
var utilities = require('./config/utilities');
var mm = require('./config/message_manager').mm;
var app = express();

/********* route includes *********/
var routes = {};
routes.callbacks =  require('./routes/callbacks.js');
routes.sync = require('./routes/sync.js');
routes.client = require('./routes/client');
routes.teacher = require('./routes/teacher');

/********* db connection *********/
var mongodbURL = process.env.MONGOLAB_URI;
var mongodbOptions = {};
mongoose.connect(mongodbURL, mongodbOptions);
var db = mongoose.connection;
db.on('error', function (err) {
    console.log('Mongo error from app.js '+err);
    utilities.processError(err);
});
db.once('open', function callback () {
    routes.teacher.createTestUser();
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

/********* express *********/
app.use(express.static(path.join(__dirname, process.env.STATIC_FOLDER)));
app.use(express.static(path.join(__dirname, 'node_modules')));

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

/********* callback *********/
app.get('/auth/facebook',           passport.authenticate('facebook',           { scope : 'email' }));
app.get('/auth/facebook/callback',  passport.authenticate('facebook'),          routes.callbacks.fbcallback);

app.get('/auth/google',             passport.authenticate('google',             { scope: 'email' }));
app.get('/auth/google/callback',    passport.authenticate('google'),            routes.callbacks.googlecallback);

app.get('/auth/localapikey',        passport.authenticate('localapikey'),       routes.callbacks.localapicallback);

/********* authenticated (teacher only) operations *********/
app.get('/user',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getUser);
app.get('/userexists/:email',       jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.userExists);
app.put('/user',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateUser);
app.get('/walls',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWalls);
app.get('/wall/:id',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWall);
app.get('/wall/:wall_id/question/:question_id/contributors',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getQuestionContributors);
app.post('/wall',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createWall);
app.put('/wall',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateWall);
app.post('/question',               jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createQuestion);
app.put('/question',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateQuestion);
app.delete('/question/:wall_id/:question_id',           jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.deleteQuestion);
app.get('/change/:nickname/:wall_id/:question_id/:previous_question_id',      jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.notifyChangeQuestion);
app.get('/pollteacher/:nickname/:wall_id/:question_id/:previous_question_id/:controlString',          jwt({secret: secret.secretToken}),  tokenManager.verifyToken,  routes.teacher.poll);
app.get('/disconnectteacher/:nickname/:wall_id',               jwt({secret: secret.secretToken}),  tokenManager.verifyToken,     routes.teacher.disconnectWall);
app.post('/messageteacher',                                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,     routes.teacher.createMessage);
app.put('/messageteacher',                                     jwt({secret: secret.secretToken}),  tokenManager.verifyToken,     routes.teacher.updateMessages);
app.post('/logs/:wall_id/:startdatetime/:enddatetime/:timelinetime/:selectedtypes',          jwt({secret: secret.secretToken}),  tokenManager.verifyToken,        routes.teacher.getLogs);

/********* student / teacher operations *********/
app.get('/clientwall/:nickname/:pin',                                                               routes.client.getWallByPin);
app.get('/clientwall/:wall_id',                                                                     routes.client.getWallById);
app.get('/disconnect/:nickname/:wall_id',                                                           routes.client.disconnectWall);
app.get('/poll/:nickname/:wall_id/:question_id/:previous_question_id/:controlString',               routes.client.poll);
app.post('/message',                                                                                routes.client.createMessage);
app.put('/message',                                                                                 routes.client.updateMessages);
app.get('/messages/:question_id',                                                                   routes.client.getMessages);
app.get('/export/:wall_id',                                                                         routes.client.exportWall);
app.post('/logs/:wall_id/:nickname',                                                                 routes.client.createLogs);

/********* setup & debug *********/
app.get('/ping',                                                                                    routes.sync.ping());

if(process.env.STATIC_FOLDER === 'src') {   // Only enable this route if we are using development .env file
    app.delete('/wall/:id',   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,         routes.teacher.deleteWall);
}

// middleware which blocks requests when we're too busy
app.use(function(req, res, next) {
    if (toobusy()) {
        res.status(503).send("I'm busy right now, sorry.");
    } else {
        next();
    }
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

/********* start the server *********/
var server = app.listen(port);
console.log('--> talkwall is listening on port: ' + port);

mm.pruneWalls();

process.on('SIGINT', function() {
    server.close();
    // calling .shutdown allows your process to exit normally
    toobusy.shutdown();
    process.exit();
});
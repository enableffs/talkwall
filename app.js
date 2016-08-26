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
console.log('--> samtavla-services listening on port: ' + port);

/********* callback *********/
app.get('/auth/facebook',           passport.authenticate('facebook',           { scope : 'email' }));
app.get('/auth/facebook/callback',  passport.authenticate('facebook'),          routes.callbacks.fbcallback);

app.get('/auth/google',             passport.authenticate('google',             { scope: 'email' }));
app.get('/auth/google/callback',    passport.authenticate('google'),            routes.callbacks.googlecallback);

app.get('/auth/localapikey',        passport.authenticate('localapikey'),       routes.callbacks.localapicallback);

/********* authenticated (teacher only) operations *********/
app.get('/user',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getUser);
app.put('/user',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateUser);
app.get('/walls',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWalls);
app.get('/wall/:id',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWallAuthorised);
app.get('/wall/:wid/question/:qid/contributors',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getQuestionContributors);
app.post('/wall',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createWall);
app.put('/wall',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateWall);
app.post('/question',               jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createQuestion);
app.put('/question',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateQuestion);
app.delete('/question/:wall_id/:question_id',           jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.deleteQuestion);
app.get('/change/:wall_id/:question_id',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.notifyChangeQuestion);
app.put('/wall/close/:wall_id',                         jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.closeWall);

/********* client (student / teacher) operations *********/
app.get('/clientwall/:nickname/:pin',                                                               routes.client.clientWall);
app.get('/disconnect/:nickname/:pin/:question_id',                                                  routes.client.disconnectWall);
app.get('/poll/:nickname/:wall_id/:question_id/:previous_question_id/:control',                     routes.client.poll);
app.post('/message',                                                                                routes.client.createMessage);
app.put('/message',                                                                                 routes.client.updateMessage);
app.get('/messages/:question_id',                                                                   routes.client.getMessages);
app.get('/export/:wallid',                                                                          routes.client.exportWall);
/********* setup & debug *********/
app.get('/ping',                                                                                    routes.sync.ping());

if(process.env.STATIC_FOLDER === 'src') {   // Only enable this route if we are using development .env file
    app.delete('/wall/:id',   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,         routes.teacher.deleteWall);
}
'use strict';
/**
 *
 * Test suite for the express4 REST api
 *
 * Prereq: install mocha (npm install mocha -g)
 *
 * -> to run the test, at the root of the directory execute: mocha
 * *
 */

var dotenv = require('dotenv');
dotenv.load();

var superagent = require('superagent');
var expect = require('expect.js');
var common = require('../config/common');
var mongoose = require('mongoose');
var baseurl = process.env.MOCHA_BASE_URL;

// Server init tests ----------------------------------------

describe('talkwall server ready', function() {
    it('test ping server', function(done){
        superagent.get(baseurl+'/ping')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.PING_OK.status);
                expect(res.body.message).to.eql(common.StatusMessages.PING_OK.message);
                done();
            });
    });
});

/*  =========   AUTHORISED (TEACHER ONLY) CALLS ========== */

var TEACHER_API_KEY = "abcdef";
var TEACHER_TOKEN = "";
var TEACHER_NICKNAME = 'teacher';
var FIRST_CLIENT_NICKNAME = 'john';
var SECOND_CLIENT_NICKNAME = 'dave';
var FIRST_WALL = {};

describe('authenticate a local user for testing purposes', function() {
    it('should return authenticate success', function(done){
        superagent.get(baseurl+'/auth/localapikey')
            .send({
                apikey: TEACHER_API_KEY
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.LOGIN_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.LOGIN_SUCCESS.message);
                TEACHER_TOKEN = res.body.token;
                done();
            });
    });
});

var TEACHER_USER = {};

describe('get the user details', function() {
    it('should return authenticated Users model', function(done){
        superagent.get(baseurl+'/user')
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.GET_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.GET_SUCCESS.message);
                expect(res.body.result.nickname).to.eql("teacher");
                TEACHER_USER = res.body.result;
                done();
            });
    });
});

describe('update the user details', function() {
    it('should return authenticated Users model', function(done){

        TEACHER_USER.defaultEmail = "zxy@zxy.net";

        superagent.put(baseurl+'/user')
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .send({
                user: TEACHER_USER
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.UPDATE_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.UPDATE_SUCCESS.message);
                expect(res.body.result.defaultEmail).to.eql("zxy@zxy.net");
                done();
            });
    });
});

describe('teacher creates a new wall', function() {

    it('should return create success status, with a wall model as result', function(done) {
        superagent.post(baseurl+'/wall')
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .send({
                label: "first client wall"
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.CREATE_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.CREATE_SUCCESS.message);
                expect(res.body.result.label).to.eql("first client wall");
                FIRST_WALL = res.body.result;
                done();
            });
    });
});

describe('teacher gets a list of walls they have created', function() {

    it('should return a list containing the first wall', function(done){
        superagent.get(baseurl+'/walls')
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.GET_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.GET_SUCCESS.message);
                expect(res.body.result[0].label).to.eql("first client wall");
                done();
            });
    });
});

describe('teacher gets details for a particular wall', function() {

    it('should return details including question ids for this wall', function(done){
        superagent.get(baseurl+'/wall/' + FIRST_WALL._id)
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.GET_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.GET_SUCCESS.message);
                expect(res.body.result.questions.length).to.eql(0);
                done();
            });
    });
});

describe('teacher adds a new question', function() {

    it('should return confirmation question was added to this wall', function(done){
        superagent.post(baseurl+'/question')
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .send({
                wall_id: FIRST_WALL._id,
                question: { label: "What is the meaning of life?" }
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.CREATE_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.CREATE_SUCCESS.message);
                FIRST_WALL.questions.push(res.body.result);
                done();
            });
    });
});

describe('teacher updates details for a particular wall. ' +
    'Wall Update is also used to set the teacher_question_id, or close the wall', function() {
    it('should return updated details including question ids for this wall', function(done){

        FIRST_WALL.label = "The First Client Wall";

        superagent.put(baseurl+'/wall')
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .send({
                wall: FIRST_WALL,
                nickname: TEACHER_NICKNAME,
                pollupdate: {
                    status: {
                        commands_to_server: {
                            teacher_question_id: FIRST_WALL.questions[0]._id,
                            wall_closed: false
                        }
                    }
                }
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.UPDATE_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.UPDATE_SUCCESS.message);
                expect(res.body.result.label).to.eql("The First Client Wall");
                done();
            });
    });
});




/*  =========   NON-AUTHORISED (STUDENT / TEACHER) CALLS ========== */

/*
describe('teacher selects a question. Result should include 0 messages', function() {
    it('should return question details', function(done){
        superagent.get(baseurl+'/question/' + FIRST_WALL._id + '/' + FIRST_WALL.questions[0] + '/' + TEACHER_NICKNAME)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.GET_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.GET_SUCCESS.message);
                expect(res.body.result.label).to.eql("What is the meaning of life?");
                expect(res.body.result.messages.length).to.eql(0);
                done();
            });
    });
});
*/

describe('first client connects to the first wall created by teacher', function() {
    it('should return successful client connection', function(done){
        superagent.get(baseurl+'/join/' + FIRST_CLIENT_NICKNAME + '/' + FIRST_WALL.pin)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.message);
                done();
            });
    });
});

/*
describe('first client selects a question. Result should include 0 messages', function() {
    it('should return question details', function(done){
        superagent.get(baseurl+'/question/' + FIRST_WALL._id + '/' + FIRST_WALL.questions[0] + '/' + FIRST_CLIENT_NICKNAME)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.GET_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.GET_SUCCESS.message);
                expect(res.body.result.label).to.eql("What is the meaning of life?");
                expect(res.body.result.messages.length).to.eql(0);
                done();
            });
    });
});
*/

describe('second client connects to the first wall created by teacher', function() {
    it('should return successful client connection', function(done){
        superagent.get(baseurl+'/join/' + SECOND_CLIENT_NICKNAME + '/' + FIRST_WALL.pin)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.message);
                done();
            });
    });
});

/*
describe('second client selects a question. At this stage both clients should be on the same question', function() {
    it('should return question details', function(done){
        superagent.get(baseurl+'/question/' + FIRST_WALL._id + '/' + FIRST_WALL.questions[0] + '/' + SECOND_CLIENT_NICKNAME)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.GET_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.GET_SUCCESS.message);
                expect(res.body.result.label).to.eql("What is the meaning of life?");
                done();
            });
    });
});
*/

describe('teacher polls for the first time, gets nothing new, but sets the teacher-question_id', function() {
    it('should return successful poll status and the message updated by the first user', function(done){
        superagent.get(baseurl+'/poll/' + TEACHER_NICKNAME + '/' + FIRST_WALL._id + '/' +
                FIRST_WALL.questions[0]._id + '/' + FIRST_WALL.questions[0]._id + '/' + 'new')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.connected_nicknames.length).to.eql(1);
                expect(res.body.result.messages.length).to.eql(0);
                done();
            });
    });
});

describe('second client polls for the first time, gets no messages but gets connected users', function() {
    it('should return successful poll status no messages', function(done){
        superagent.get(baseurl+'/poll/' + SECOND_CLIENT_NICKNAME + '/' + FIRST_WALL._id + '/' +
                FIRST_WALL.questions[0]._id + '/' + FIRST_WALL.questions[0]._id + '/' + 'new')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.connected_nicknames.length).to.eql(2);
                expect(res.body.result.messages.length).to.eql(0);
                done();
            });
    });
});

describe('first client polls for the first time, gets nothing new', function() {
    it('should return successful poll status and the message updated by the first user', function(done){
        superagent.get(baseurl+'/poll/' + FIRST_CLIENT_NICKNAME + '/' + FIRST_WALL._id + '/' +
                FIRST_WALL.questions[0]._id + '/' + FIRST_WALL.questions[0]._id + '/' + 'new')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.connected_nicknames.length).to.eql(3);
                expect(res.body.result.messages.length).to.eql(0);
                done();
            });
    });
});

// Now the fun begins!

var FIRST_CLIENT_MESSAGE = {
    question_id: "",
    creator: FIRST_CLIENT_NICKNAME,
    text: "No one knows",
    origin: [{nickname: FIRST_CLIENT_NICKNAME, message_id: ''}],
    edits: [{date: Date.now(), text: "No one knows"}],
    board: {}
};

describe('first client sends a message', function() {
    it('should return question details', function(done) {

        FIRST_CLIENT_MESSAGE.question_id = FIRST_WALL.questions[0]._id;

        superagent.post(baseurl+'/message')
            .send({
                message: FIRST_CLIENT_MESSAGE,
                pin: FIRST_WALL.pin,
                nickname: FIRST_CLIENT_NICKNAME
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.CREATE_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.CREATE_SUCCESS.message);
                expect(res.body.result.text).to.eql("No one knows");

                FIRST_CLIENT_MESSAGE._id = res.body.result._id;

                done();
            });
    });
});


describe('first client polls for new data', function() {
    it('should return poll success status, no new messages from anyone else and correct question id', function(done) {
        superagent.get(baseurl+'/poll/' + FIRST_CLIENT_NICKNAME + '/' + FIRST_WALL._id + '/' +
            FIRST_WALL.questions[0]._id + '/' + FIRST_WALL.questions[0]._id + '/' + 'poll')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.commands_to_server.teacher_question_id).to.eql(FIRST_WALL.questions[0]._id);
                expect(res.body.result.status.connected_nicknames.length).to.eql(3);
                expect(res.body.result.messages.length).to.eql(0);
                done();
            });
    });
});

describe('second client polls for new data, gets first clients new data', function() {
    it('should return successful poll status and the message updated by the first user', function(done){
        superagent.get(baseurl+'/poll/' + SECOND_CLIENT_NICKNAME + '/' + FIRST_WALL._id + '/' +
                FIRST_WALL.questions[0]._id + '/' + FIRST_WALL.questions[0]._id + '/' + 'poll')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.commands_to_server.teacher_question_id).to.eql(FIRST_WALL.questions[0]._id);
                expect(res.body.result.status.connected_nicknames.length).to.eql(3);
                expect(res.body.result.messages.length).to.eql(1);
                expect(res.body.result.messages[0].text).to.eql("No one knows");
                done();
            });
    });
});

describe('second client updates a message by putting it on the board', function() {
    it('should return success status', function(done) {

        FIRST_CLIENT_MESSAGE.board[SECOND_CLIENT_NICKNAME] = {
            xpos:   100,
            ypos:   200
        };

        superagent.put(baseurl+'/message')
            .send({
                message: FIRST_CLIENT_MESSAGE,
                pin: FIRST_WALL.pin,
                nickname: SECOND_CLIENT_NICKNAME
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.UPDATE_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.UPDATE_SUCCESS.message);
                done();
            });
    });
});

describe('first client polls for new data again', function() {
    it('should return poll success status, updated message including second nickname on board and correct question id', function(done){
        superagent.get(baseurl+'/poll/' + FIRST_CLIENT_NICKNAME + '/' + FIRST_WALL._id + '/' +
                FIRST_WALL.questions[0]._id + '/' + FIRST_WALL.questions[0]._id + '/' + 'poll')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.commands_to_server.teacher_question_id).to.eql(FIRST_WALL.questions[0]._id);
                expect(res.body.result.status.connected_nicknames.length).to.eql(3);
                expect(res.body.result.messages.length).to.eql(1);
                expect(res.body.result.messages[0].board[SECOND_CLIENT_NICKNAME].xpos).to.eql(100);
                done();
            });
    });
});


/*  ===============    CLEANUP    =============== */

describe('remove the test Wall and associated questions and messages', function() {

    it('should return success', function(done){
        superagent.delete(baseurl+'/wall/' + FIRST_WALL._id)
            .set('Authorization', 'Bearer '+ TEACHER_TOKEN)
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.DELETE_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.DELETE_SUCCESS.message);
                done();
            });
    });
});
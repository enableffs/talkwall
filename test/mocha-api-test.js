'use strict';
/**
 *
 * Jeremyt - 11/06/2015
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

describe('samtavla server ready', function() {
    it('test ping server', function(done){
        superagent.get(baseurl+'/ping')
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.PING_OK.status);
                expect(res.body.message).to.eql(common.StatusMessages.PING_OK.message);
                done();
            });
    });
});


describe('first client connects to the server', function() {
    it('should return successful client connection', function(done){
        superagent.put(baseurl+'/connect')
            .send({
                question_id: "1",
                user_id: "1"
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.message);
                done();
            });
    });
});

describe('second client connects to the server', function() {
    it('should return successful client connection', function(done){
        superagent.put(baseurl+'/connect')
            .send({
                question_id: "1",
                user_id: "2"
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.CLIENT_CONNECT_SUCCESS.message);
                done();
            });
    });
});

describe('first client polls with new data', function() {

    it('should return poll success status, no updated messages [] and question id "1"', function(done){
        superagent.put(baseurl+'/poll')
            .send({
                question_id: "1",
                user_id: "1",
                message_ids: ['a','b','c'],
                status: { question_id: 1 }
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.question_id).to.eql("1");
                expect(res.body.result.messages.length).to.eql(0);
                done();
            });
    });
});

describe('second client polls with new data, gets first clients new data', function() {

    it('should return successful poll status and the messages updated by the first user [a,b,c]', function(done){
        superagent.put(baseurl+'/poll')
            .send({
                question_id: "1",
                user_id: "2",
                message_ids: ['c','d','e'],
                status: { question_id: "1" }
            })
            .end(function(e,res) {
                expect(res.statusCode).to.eql(common.StatusMessages.POLL_SUCCESS.status);
                expect(res.body.message).to.eql(common.StatusMessages.POLL_SUCCESS.message);
                expect(res.body.result.status.question_id).to.eql("1");
                expect(res.body.result.messages[0]).to.eql("a");
                done();
            });
    });
});
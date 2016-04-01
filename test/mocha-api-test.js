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
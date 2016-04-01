'use strict';

var moment = require('moment');
var common = require('../config/common.js');

var systemOK = true;
var error = '';

exports.processError = function(error) {
    systemOK = false;
    error = error;
};
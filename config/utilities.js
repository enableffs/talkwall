'use strict';

var moment = require('moment');
var common = require('../config/common.js');
var postmark = require('postmark');
var prom = require('promise');

var systemOK = true;
var error = '';

exports.processError = function(error) {
    systemOK = false;
    error = error;
};

exports.getRandomBetween = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

exports.sendMail = function(mail) {

    //create a send email promise and return it
    return new prom(function (resolve) {

        //avoid sending emails all the time when testing
        /*if(process.env.STATIC_FOLDER === 'src') {
            console.log('sendMail (src) | From: '+mail.from+' | To: '+mail.to+' | TextBody: '+mail.text);
            resolve({code: 200, message: 'OK'});
        }
        else {*/
            var client = new postmark.Client(process.env.POSTMARK_API_KEY);

            client.sendEmail({
                'From': mail.from,
                'To': mail.to,
                'Subject': mail.subject,
                'HtmlBody': mail.html,
                'TextBody': mail.text
            }, function(error, success) {
                if(error) {
                    resolve({code: 400, message: error});
                }
                else {
                    resolve({code: 200, message: common.StatusMessages.INVITE_EMAIL_SEND_SUCCESS.status});
                }
            });
        //}
    });
};
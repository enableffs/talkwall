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

'use strict';

var moment = require('moment');
var common = require('../config/common.js');


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
	return new Promise(function (resolve) {

		//avoid sending emails all the time when testing
		if(process.env.STATIC_FOLDER === 'src') {
			console.log('sendMail (src) | From: ' + mail.from + ' | To: ' + mail.to + ' | TextBody: ' + mail.text);
			resolve({code: 200, message: 'OK'});
		}
		else {
			var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
			var request = sg.emptyRequest({
				method: 'POST',
				path: '/v3/mail/send',
				body: {
					personalizations: [
						{
							to: [
								{
									email: mail.to
								}
							],
							subject: mail.subject
						}
					],
					from: {
						email: mail.from
					},
					content: [
						{
							type: 'text/plain',
							value: mail.text
						},
						{
							type: 'text/html',
							value: mail.html
						}
					]
				}
			});
			sg.API(request, function (error, response) {
				if (error) {
					resolve({code: 400, message: error});
				}
				resolve({code: 200, message: common.StatusMessages.INVITE_EMAIL_SEND_SUCCESS.status});
			});
		}
	});
};
/*
 This is the old code for sending mail with Postmark service
 */
/*
exports.sendMail = function(mail) {

    //create a send email promise and return it
    return new Promise(function (resolve) {

        //avoid sending emails all the time when testing
        if(process.env.STATIC_FOLDER === 'src') {
            console.log('sendMail (src) | From: '+mail.from+' | To: '+mail.to+' | TextBody: '+mail.text);
            resolve({code: 200, message: 'OK'});
        }
        else {
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
        }
    });
};*/

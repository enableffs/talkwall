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

var common = require('../config/common.js');
var mm = require('../config/message_manager').mm;
var redisClient = require('../config/redis_database').redisClient;
var Wall = require('../models/wall');
var Message = require('../models/message');
var Log = require('../models/log');
var moment = require('moment');

/**
 * @api {get} /poll
 *
 * @apiName poll
 * @apiGroup non-authorised
 *
 * @apiDescription Respond with any changed messages and status
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get.
 *                      Can be 'none' if we are only polling for status
 * @apiParam {String} previous_question_id ID of the previous question to assist removal from polling when changing question
 *                      Can be 'none' if not changing questions.
 * @apiParam {String} nickname Connecting client's nickname
 * @apiParam {String} controlString type of poll ('new', 'change', 'poll')
 *
 */
exports.poll = function(req, res) {

	if (typeof req.params.wall_id === 'undefined' || req.params.wall_id === null
		|| typeof req.params.question_id === 'undefined' || req.params.question_id === null
		|| typeof req.params.previous_question_id === 'undefined' || req.params.previous_question_id === null
		|| typeof req.params.nickname === 'undefined' || req.params.nickname === null
		|| typeof req.params.controlString === 'undefined' || req.params.controlString === null) {
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
			.json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
	}

	if (req.params.controlString === 'change' && req.params.previous_question_id !== 'none') {
		// We are changing questions, so remove the user from previous question and add them to the new one
		mm.removeUserFromQuestion(req.params.wall_id, req.params.previous_question_id, req.params.nickname, false);
	}

	if(!mm.userIsOnWall(req.params.wall_id, req.params.nickname)
		|| (req.params.controlString === 'new' && req.params.question_id !== 'none')
		|| (req.params.controlString === 'change' && req.params.previous_question_id !== 'none')) {
		mm.addUserToQuestion(req.params.wall_id, req.params.question_id, req.params.nickname, false);
	}

	// Return an update to the user
	var update = mm.getUpdate(req.params.wall_id, req.params.question_id, req.params.nickname, false);
	res.status(common.StatusMessages.POLL_SUCCESS.status)
		.json({message: common.StatusMessages.POLL_SUCCESS.message, result: update});

};

/**
 * @api {get} /clientwall/:nickname/:pin Get wall by pin
 *
 * @apiName getWallByPin
 * @apiGroup non-authorised
 *
 * @apiParam {String} pin Pin of the wall to get
 * @apiParam {String} nickname Connecting client's nickname
 *
 * @apiDescription Returns wall details if the pin exists and wall is open.
 *
 */
exports.getWallByPin = function(req, res) {

	if (typeof req.params.pin === 'undefined' || req.params.pin === null
		|| typeof req.params.nickname === 'undefined' || req.params.nickname === null) {
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
			.json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
	}

	// Check for the pin in Redis. If exists, look up the value == wall ID
	redisClient.get(req.params.pin, function(error, wall_id) {
		if(wall_id !== null) {

			if (!mm.wallExists(wall_id)) {
				res.status(common.StatusMessages.WALL_EXPIRED.status).json({
					message: common.StatusMessages.WALL_EXPIRED.message});
			} else if (mm.userIsOnWall(wall_id, req.params.nickname)) {
				res.status(common.StatusMessages.INVALID_USER.status).json({
					message: common.StatusMessages.INVALID_USER.message});
			} else {

				var query = Wall.findOne({
					_id: wall_id,
					closed: false
				}).lean().populate({path: 'createdBy', select: 'google.name facebook.name local.name'});

				query.exec(function (error, wall) {
					if (error) {
						res.status(common.StatusMessages.GET_ERROR.status).json({
							message: common.StatusMessages.GET_ERROR.message, result: error
						});
					}
					else {
						res.status(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status).json({
							message: common.StatusMessages.CLIENT_CONNECT_SUCCESS.message,
							result: wall
						});
					}
				});
			}
		} else {        // Pin has expired or does not exist
			res.status(common.StatusMessages.PIN_DOES_NOT_EXIST.status).json({
				message: common.StatusMessages.PIN_DOES_NOT_EXIST.message});
		}
	});
};

/**
 * @api {get} /clientwall/:wall_id Get wall by wall_id
 *
 * @apiName getWallById
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 *
 */
exports.getWallById = function(req, res) {

	if (typeof req.params.wall_id === 'undefined' || req.params.wall_id === null) {
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
			.json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
	}

	var query = Wall.findOne({ _id: req.params.wall_id }).lean();
	query.exec(function (error, wall) {
		if (error || wall === null) {
			res.status(common.StatusMessages.GET_ERROR.status).json({
				message: common.StatusMessages.GET_ERROR.message, result: error
			});
		}
		else {
			res.status(common.StatusMessages.GET_SUCCESS.status).json({
				message: common.StatusMessages.GET_SUCCESS.message,
				result: wall
			});
		}
	});
};

/**
 * @api {get} /disconnect Disconnect from wall
 *
 * @apiName disconnectWall
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} nickname Connecting client's nickname
 *
 * @apiDescription Disconnect from a wall. Removes user from wall's nickname list
 *
 */
exports.disconnectWall = function(req, res) {

	if (typeof req.params.wall_id === 'undefined' || req.params.wall_id === null
		|| typeof req.params.nickname === 'undefined' || req.params.nickname === null) {
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
			.json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
	}

	// Check for the student on the wall
	if(mm.userIsOnWall(req.params.wall_id, req.params.nickname)) {
		// Remove nickname from the wall users list (message manager)
		mm.removeUserFromWall(req.params.wall_id, req.params.nickname, false);
	}
	res.status(common.StatusMessages.CLIENT_DISCONNECT_SUCCESS.status).json({
		message: common.StatusMessages.CLIENT_DISCONNECT_SUCCESS.message});
};

/**
 * @api {post} /message Create message
 *
 * @apiName createMessage
 * @apiGroup non-authorised
 *
 * @apiParamExample {json} Input
 *  {
 *      "wall_id": "123412341234123412341234",
 *      "nickname": "my_nickname",
 *      "message": {
 *          "question_id": "dcbadcbadcbadcbadcbadcba",
 *          "text": "New message text content",
 *          "creator": "my_nickname",
 *          "origin": [
 *              {
 *                  "nickname": "my_nickname"
 *              }
 *          ]
 *      }
 *  }
 *
 * @apiDescription Create a new message and add its ID to the Question on the given wall
 *
 * @apiSuccess {Message} message The created message
 */
exports.createMessage = function(req, res) {

	if (typeof req.body.message === 'undefined' || req.body.message === null
		|| typeof req.body.wall_id === 'undefined' || req.body.wall_id === null
		|| typeof req.body.nickname === 'undefined' || req.body.nickname === null) {
		console.log('TW: POST /message ( nick: ' + req.body.nickname +
			' wall: ' + req.body.wall_id + ' )  : ' +
			common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status + ' ' +
			common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message);
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status).json({
			message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message });
	}

	// if (mm.userIsOnWall(req.body.wall_id, req.body.nickname)) {

	// Create a new Message with the supplied object, including board properties   *** Not vetted!! :S
	var newMessage = new Message(req.body.message);
	newMessage.save(function (error, message) {
		if (error || message === null) {
			console.log('TW: POST /message ( nick: ' + req.body.nickname +
				' wall: ' + req.body.wall_id + ' )  : ' +
				common.StatusMessages.CREATE_ERROR.status + ' ' +
				common.StatusMessages.CREATE_ERROR.message + '(message save)');
			res.status(common.StatusMessages.CREATE_ERROR.status).json({
				message: common.StatusMessages.CREATE_ERROR.message, result: error });
		}
		else {
			// Update the message manager to notify other clients
			mm.postUpdate(req.body.wall_id, req.body.message.question_id, req.body.nickname, message, 'create', false);

			// Update the question with this new message, and return
			Wall.findOneAndUpdate({
				'_id': req.body.wall_id,
				'questions._id': req.body.message.question_id
			}, { $push: { "questions.$.messages" : message}, $addToSet: { "questions.$.contributors" : req.body.nickname }}, function(error, wall) {
				if(error || wall === null) {
					console.log('TW: POST /message ( nick: ' + req.body.nickname +
						' wall: ' + req.body.wall_id + ' )  : ' +
						common.StatusMessages.CREATE_ERROR.status + ' ' +
						common.StatusMessages.CREATE_ERROR.message  + '(wall update)');
					res.status(common.StatusMessages.CREATE_ERROR.status).json({
						message: common.StatusMessages.CREATE_ERROR.message });
				} else {
					res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
						message: common.StatusMessages.CREATE_SUCCESS.message, result: message
					});
				}
			});
		}
	});

};

/**
 * @api {get} /messages/:question_id Get messages for question
 * @apiName getMessages
 * @apiGroup non-authorised
 *
 * @apiParam {String} question_id
 *
 * @apiSuccess {[Message]} messages List of messages found
 */
exports.getMessages = function(req, res) {

	if (typeof req.params.question_id === 'undefined' || req.params.question_id === null) {
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
			.json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
	}

	var query = Message.find({
		'question_id' : req.params.question_id
	}).lean();

	query.exec(function(error, messages) {
		if(error || messages === null) {
			res.status(common.StatusMessages.GET_ERROR.status).json({
				message: common.StatusMessages.GET_ERROR.message, result: error});
		}
		else {
			res.status(common.StatusMessages.GET_SUCCESS.status).json({
				message: common.StatusMessages.GET_SUCCESS.message, result: messages});
		}
	})
};

/**
 * @api {put} /message Edit a message
 * @apiName updateMessages
 * @apiGroup non-authorised
 *
 * @apiParamExample {json} Input
 *  {
 *      "wall_id": "123412341234123412341234",
 *      "nickname": "my_nickname",
 *      "controlString": "none | edit | position"
 *      "messages": [
 *          {
 *              "_id": "567856785678567856785678",
 *              "question_id": "dcbadcbadcbadcbadcbadcba",
 *              "text": "New message text content",
 *              "creator": "my_nickname",
 *              "origin": [
 *                  {
 *                      "nickname": "my_nickname"
 *                  }
 *              ]
 *          }
 *       ]
 *  }
 *
 * @apiDescription Update a list of messages
 *
 * @apiSuccess {[Message]} messages List of updated messages
 */
exports.updateMessages = function(req, res) {

	if (typeof req.body.messages === 'undefined' || req.body.messages === null
		|| typeof req.body.wall_id === 'undefined' || req.body.wall_id === null
		|| typeof req.body.controlString === 'undefined' || req.body.controlString === null
		|| typeof req.body.nickname === 'undefined' || req.body.nickname === null) {

		console.log('TW: PUT /message ( nick: ' + req.body.nickname + ' control: ' +
			req.body.controlString + ' wall: ' + req.body.wall_id + ' )  : ' +
			common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status + ' ' +
			common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message);
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status).json({
			message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message });
	}

	req.body.messages.forEach(function(incomingMessage) {
		var query = Message.findOne({ _id: incomingMessage._id });
		query.exec(function(error, foundMessage) {
			if(error || foundMessage === null) {
				res.status(common.StatusMessages.DATABASE_ERROR.status).json({
					message: common.StatusMessages.DATABASE_ERROR.message, result: error});
			} else {
				switch (req.body.controlString) {
					case "position":
						if (incomingMessage.board.hasOwnProperty(req.body.nickname)) {
							foundMessage.board[req.body.nickname] = {
								xpos: incomingMessage.board[req.body.nickname].xpos,
								ypos: incomingMessage.board[req.body.nickname].ypos,
								highlighted: incomingMessage.board[req.body.nickname].highlighted
							}
						} else {
							delete foundMessage.board[req.body.nickname];
						}
						foundMessage.markModified('board');
						break;
					case "edit":
						foundMessage.deleted = incomingMessage.deleted;
						foundMessage.text = incomingMessage.text;
						break;
					case "none":
						break;
				}
				foundMessage.save();

				var m = foundMessage.toObject();
				if (req.body.controlString !== "none" && m.hasOwnProperty('question_id')) {
					mm.postUpdate(req.body.wall_id, m.question_id.toHexString(), req.body.nickname, m, req.body.controlString, false);
				}
				res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
					message: common.StatusMessages.UPDATE_SUCCESS.message, result: null
				});
			}
		});
	});
};


/**
 * @api {get} /export/:wallid Export wall
 * @apiName exportWall
 * @apiGroup non-authorised
 *
 * @apiParams {String} wall_id
 *
 * @apiDescription Collate and return export information for this wall - wall, questions, messages
 *
 * @apiSuccess {Wall} wall populated with questions and messages
 */
exports.exportWall = function(req, res) {

	if (typeof req.params.wall_id === 'undefined' || req.params.wall_id === null) {
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
			.json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
	}

	var query = Wall.findOne({
		_id : req.params.wall_id
	});
	query.select('-pin');
	query.select('-closed');
	query.exec(function(error, wall) {
		if(error || wall === null) {
			res.status(common.StatusMessages.DATABASE_ERROR.status).json({
				message: common.StatusMessages.DATABASE_ERROR.message, result: error});
		}
		else {
			var expandedResultsPromise = [];
			wall.questions.forEach(function(question) {    // Collect Fixtures for the user and include in return
				expandedResultsPromise.push(populateQuestion(question));
			});
			Promise.all(expandedResultsPromise).then(function(questionsArray) {
				wall.questions = questionsArray;
				res.status(common.StatusMessages.GET_SUCCESS.status).json({
					message: common.StatusMessages.GET_SUCCESS.message, result: wall});
			}).catch(function() {
				res.status(common.StatusMessages.DATABASE_ERROR.status)
					.json({message: common.StatusMessages.DATABASE_ERROR.message});
			});
		}
	});
};

function populateQuestion(question) {

	return new Promise(function(resolve, reject) {

		var query = Message.find({question_id: question._id});
		query.exec(function (err, messages) {
			if (err || messages === null) {
				reject(err);
			}
			question.messages = messages;
			resolve(question);
		});
	});
}


/**
 * @api {post} /logs/:wall_id/:nickname Add logs
 * @apiName addLogs
 * @apiGroup non-authorised
 *
 * @apiParam {String } wall_id
 * @apiParam {String } nickname
 *
 * @apiParamExample {json} Input
 *  {
 *      logs: [
 *          {
 *               "q_id": "dcbadcbadcbadcbadcbadcba",
 *               "type": "code representing log type",
 *               "itemid": "message or question ID",
 *               "nick": "nickname",
 *               "text": "current message or question text",
 *               "stamp": "date stamp made by client",
 *               "diff": {
 *                  "x": "0.xxx",
 *                  "y": "0.yyy"
 *               },
 *               "basedOn": {
 *                   "itemid": "originating message ID",
 *                   "nick":   "nickname of originating creator",
 *                   "text":   "text of the originating message"
 *               }
 *          }
 *      ]
 *  }
 *
 * @apiDescription Create a new question
 */
exports.createLogs = function(req, res) {

	if (typeof req.body.logs === 'undefined' || req.body.logs === null
		|| typeof req.params.wall_id === 'undefined' || req.params.wall_id === null
		|| typeof req.params.nickname === 'undefined' || req.params.nickname === null) {
		console.log('TW: logs/' + req.params.wall_id + '/' + req.params.nickname +
			' : ' + common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status + ' ' +
			common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message);
		res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status).json({
			message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message });
	}

    /*
     if (mm.userIsOnWall(req.params.wall_id, req.params.nickname)) {
     */

	var multiSavePromise = [];
	req.body.logs.forEach(function(log) {
		var newLog = new Log(log);
		var p = newLog.save();
		multiSavePromise.push(p);
	});

	Promise.all(multiSavePromise).then(function() {
		res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
			message: common.StatusMessages.CREATE_SUCCESS.message
		});
	}).catch(function() {
		console.log('TW: logs/' + req.params.wall_id + '/' + req.params.nickname +
			' : ' + common.StatusMessages.CREATE_ERROR.status + ' ' +
			common.StatusMessages.CREATE_ERROR.message);
		res.status(common.StatusMessages.CREATE_ERROR.status).json({
			message: common.StatusMessages.CREATE_ERROR.message });
	});

    /*
     } else {
     console.log('TW: logs/' + req.params.wall_id + '/' + req.params.nickname +
     ' : ' + common.StatusMessages.INVALID_USER.status + ' ' +
     common.StatusMessages.INVALID_USER.message);
     res.status(common.StatusMessages.INVALID_USER.status).json({
     message: common.StatusMessages.INVALID_USER.message });
     }
     */
};
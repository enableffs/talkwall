/**
 * Created by richardnesnass on 31/05/16.
 */

var common = require('../config/common.js');
var mm = require('../config/message_manager').mm;
var redisClient = require('../config/redis_database').redisClient;
var Wall = require('../models/wall');
var Question = require('../models/question');
var Message = require('../models/message');
var Utilities = require('../config/utilities');

/**
 * @api {get} /poll Respond to this call with any changed messages and status
 *
 * @apiName poll
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get
 * @apiParam {String} previous_question_id ID of the previous question to assist removal from polling
 * @apiParam {String} nickname Connecting client's nickname
 * @apiParam {String} control type of poll ('new', 'change', 'poll')
 *
 */
exports.poll = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null
        || typeof req.params.previous_question_id === 'undefined' || req.params.previous_question_id == null
        || typeof req.params.nickname === 'undefined' || req.params.nickname == null
        || typeof req.params.control === 'undefined' || req.params.control == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    if (req.params.control === 'change' && req.params.previous_question_id !== 'none') {
        // We are changing questions, so remove the user from previous question and add them to the new one
        mm.removeUser(req.params.wall_id, req.params.previous_question_id, req.params.nickname);
        mm.addUser(req.params.wall_id, req.params.question_id, req.params.nickname);
    } else if (req.params.control === 'new') {
        // We are entering for the first time, so add the user
        mm.addUser(req.params.wall_id, req.params.question_id, req.params.nickname);
    }

    // Return an update to the user
    var update = mm.getUpdate(req.params.wall_id, req.params.question_id, req.params.nickname);
    return res.status(common.StatusMessages.POLL_SUCCESS.status)
        .json({message: common.StatusMessages.POLL_SUCCESS.message, result: update});

};

/**
 * @api {get} /join Join a wall with pin - simply returns wall details if the pin exists and wall is open.
 * Adds user to wall nickname list
 *
 * @apiName joinWall
 * @apiGroup non-authorised
 *
 * @apiParam {String} pin Pin of the wall to get
 * @apiParam {String} nickname Connecting client's nickname
 *
 */
exports.joinWall = function(req, res) {

    if (typeof req.params.pin === 'undefined' || req.params.pin == null
        || typeof req.params.nickname === 'undefined' || req.params.nickname == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    // Check for the pin in Redis. If exists, look up the value == wall ID
    redisClient.get(req.params.pin, function(error, wall_id) {
        if(wall_id !== null) {
            var query = Wall.findOne({
                _id : wall_id,
                pin : { $gte: 0 }       // Wall is not available to clients if pin is -1
            }).lean();

            query.exec(function(error, wall) {
                if(error) {
                    return res.status(common.StatusMessages.GET_ERROR.status).json({
                        message: common.StatusMessages.GET_ERROR.message, result: error});
                }
                else {
                    return res.status(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status).json({
                        message: common.StatusMessages.CLIENT_CONNECT_SUCCESS.message, result: wall});
                }
            });
        } else {        // Pin has expired or does not exist
            return res.status(common.StatusMessages.PIN_DOES_NOT_EXIST.status).json({
                message: common.StatusMessages.PIN_DOES_NOT_EXIST.message});
        }
    });
};


/**
 * @api {get} /disconnect Disconnect from a wall with pin - Removes user from wall nickname list
 *
 * @apiName disconnectWall
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get
 * @apiParam {String} nickname Connecting client's nickname
 *
 */
exports.disconnectWall = function(req, res) {

    if (typeof req.params.pin === 'undefined' || req.params.pin == null
        || typeof req.params.nickname === 'undefined' || req.params.nickname == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    // Check for the pin in Redis. If exists, look up the value == wall ID
    redisClient.get(req.params.pin, function(error, wall_id) {
        if(wall_id !== null) {
            var query = Wall.findOne({
                _id : wall_id,
                pin : { $gte: 0 }       // Wall is not available to clients if pin is -1
            }).lean();

            query.exec(function(error, wall) {
                if(error) {
                    return res.status(common.StatusMessages.GET_ERROR.status).json({
                        message: common.StatusMessages.GET_ERROR.message, result: error});
                }
                else {
                    // Remove nickname from the wall users list (message manager)
                    mm.removeFromWall(req.params.wall_id, req.params.nickname);
                    return res.status(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status).json({
                        message: common.StatusMessages.CLIENT_CONNECT_SUCCESS.message, result: wall});
                }
            });
        } else {        // Pin has expired or does not exist
            return res.status(common.StatusMessages.PIN_DOES_NOT_EXIST.status).json({
                message: common.StatusMessages.PIN_DOES_NOT_EXIST.message});
        }
    });
};

/**
 * @api {get} /question Get question details including all current messages.  Adds user to the polling list.
 * @apiName getQuestion
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get
 * @apiParam {String} previous_question_id ID of the previous question to assisat removal from polling
 * @apiParam {String} nickname Connecting client's nickname
 *
 * @apiSuccess {Question} question Found question
 */
/*
exports.getQuestion = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null
        || typeof req.params.previous_question_id === 'undefined' || req.params.previous_question_id == null
        || typeof req.params.nickname === 'undefined' || req.params.nickname == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    // get a question and add the client nickname to the question polling list (message manager)
    // we also populate all messages into the question
    var query = Question.findOne({
        _id : req.params.question_id
    }).populate('messages');

    query.exec(function(error, question) {
        if(error) {
            return res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else {
            mm.removeFromQuestion(req.params.wall_id, req.params.previous_question_id, req.params.nickname);
            mm.addUser(req.params.wall_id, req.params.question_id, req.params.nickname);
            return res.status(common.StatusMessages.GET_SUCCESS.status).json({
                message: common.StatusMessages.GET_SUCCESS.message, result: question});
        }
    });

};
*/

/**
 * @api {post} /message Create a new message and add it to the Question
 * @apiName createMessage
 * @apiGroup non-authorised
 *
 * @apiSuccess {Message} message Newly created message
 */
exports.createMessage = function(req, res) {

    if (typeof req.body.message === 'undefined' || req.body.message == null
        || typeof req.body.pin === 'undefined' || req.body.pin == null
        || typeof req.body.nickname === 'undefined' || req.body.nickname == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    redisClient.get(req.body.pin, function(error, wall_id) {
        if(error) {
            return res.status(common.StatusMessages.PIN_RETRIEVAL_ERROR.status).json({
                message: common.StatusMessages.PIN_RETRIEVAL_ERROR.message
            });
        }
        if (wall_id !== null) {

            // Create a new Message with the supplied object, including board properties   *** Not vetted!! :S
            var newMessage = new Message(req.body.message);
            newMessage.board = {};
            newMessage.save(function (error, message) {
                if (error) {
                    return res.status(common.StatusMessages.CREATE_ERROR.status).json({
                        message: common.StatusMessages.CREATE_ERROR.message, result: error
                    });
                }
                else {
                    // Update the message manager to notify other clients
                    mm.putUpdate(wall_id, req.body.message.question_id, req.body.nickname, [message], null);

                    // Update the question with this new message, and return
                    Question.findOneAndUpdate({
                        '_id': req.body.message.question_id
                    }, {$push: {messages: message._id}}, function(error, question) {
                        if(error) {
                            return res.status(common.StatusMessages.CREATE_ERROR.status).json({
                                message: common.StatusMessages.CREATE_ERROR.message
                            });
                        } else {
                            return res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
                                message: common.StatusMessages.CREATE_SUCCESS.message, result: message
                            });
                        }
                    });
                }
            })
        } else {
            return res.status(common.StatusMessages.PIN_DOES_NOT_EXIST.status).json({
                message: common.StatusMessages.PIN_DOES_NOT_EXIST.message
            });
        }
    });
};

/**
 * @api {put} /message Edit a message by submitting a Message object and pin
 * @apiName updateMessage
 * @apiGroup non-authorised
 *
 */
exports.updateMessage = function(req, res) {

    if (typeof req.body.message === 'undefined' || req.body.message == null
        || typeof req.body.pin === 'undefined' || req.body.pin == null
        || typeof req.body.nickname === 'undefined' || req.body.nickname == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    redisClient.get(req.body.pin, function(error, wall_id) {
        if(error) {
            return res.status(common.StatusMessages.PIN_RETRIEVAL_ERROR.status).json({
                message: common.StatusMessages.PIN_RETRIEVAL_ERROR.message
            });
        }
        if (wall_id !== null) {
            var query = Message.findOneAndUpdate({
                _id: req.body.message._id
            }, req.body.message, {new: true});

            query.exec(function (error, message) {
                if (error) {
                    return res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                        message: common.StatusMessages.UPDATE_ERROR.message, result: error
                    });
                } else {
                    // Update the message manager to notify other clients
                    mm.putUpdate(wall_id, req.body.message.question_id, req.body.nickname, [message], null);

                    return res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                        message: common.StatusMessages.UPDATE_SUCCESS.message
                    });
                }
            })
        } else {
            return res.status(common.StatusMessages.PIN_DOES_NOT_EXIST.status).json({
                message: common.StatusMessages.PIN_DOES_NOT_EXIST.message
            });
        }
    });
};



// DATA STRUCURES

//   main Message dictionary or array

//

//  get /join
//      ->  adds
//      ->  returns 'wall' object which contains an array of connected nicknames


// get /poll/:questionid/:nickname   (includes status update)
//  returns any messages edited since last poll

// get /wall/:wallid

// get /question/:questionid/:nickname
//    -> add nickname to the message manager
// returns question and message list


// post /message  ( add new message to a questionid - text, nickname )

// put /message  (update message text, x,y)


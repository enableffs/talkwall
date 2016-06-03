/**
 * Created by richardnesnass on 31/05/16.
 */

var common = require('../config/common.js');
var mm = require('../config/message_manager').mm;
var redisClient = require('../config/redis_database').redisClient;
var Wall = require('../models/wall');
var Question = require('../models/question');
var Message = require('../models/message');

exports.poll = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null
        || typeof req.params.nickname === 'undefined' || req.params.nickname == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var result = mm.getUpdate(req.params.wall_id, req.params.question_id, req.params.nickname);
    return res.status(common.StatusMessages.POLL_SUCCESS.status)
        .json({message: common.StatusMessages.POLL_SUCCESS.message, result: result});

};

/**
 * @api {get} /join Join a wall with pin - simply returns wall details if the pin exists and wall is open
 * @apiName getQuestion
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get
 * @apiParam {String} nickname Connecting client's nickname
 *
 */
exports.joinWall = function(req, res) {

    if (typeof req.params.pin === 'undefined' || req.params.pin == null
        || typeof req.params.pin === 'undefined' || req.params.pin == null) {
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
                    // Add nickname to the wall users list (message manager)
                    mm.addUser(req.params.wall_id, '', req.params.nickname);
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
 * @api {get} /question Get question details including all current messages
 * @apiName getQuestion
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get
 * @apiParam {String} nickname Connecting client's nickname
 *
 * @apiSuccess {Question} question Found question
 */
exports.getQuestion = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null
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
            mm.addUser(req.params.wall_id, req.params.question_id, req.params.nickname);
            return res.status(common.StatusMessages.GET_SUCCESS.status).json({
                message: common.StatusMessages.GET_SUCCESS.message, result: question});
        }
    });

};

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

            // Create a new Message with the supplied object   *** Not vetted!! :S
            var newMessage = new Message(req.body.message);
            newMessage.save(function (error, message) {
                if (error) {
                    return res.status(common.StatusMessages.CREATE_ERROR.status).json({
                        message: common.StatusMessages.CREATE_ERROR.message, result: error
                    });
                }
                else {
                    // Update the message manager to notify other clients
                    mm.putUpdate(wall_id, req.body.message.question_id, req.body.nickname, [message], null);

                    // Update the question with this new message ID, and return
                    Question.findOneAndUpdate({
                        _id: req.body.message.question_id
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


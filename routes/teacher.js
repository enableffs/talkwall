/**
 * Created by richardnesnass on 02/06/16.
 */

var utilities = require('../config/utilities.js');
var common = require('../config/common');
var mm = require('../config/message_manager').mm;
var redisClient = require('../config/redis_database').redisClient;
var Wall = require('../models/wall');
var User = require('../models/user');
var Question = require('../models/question');
var Message = require('../models/message');

// Given an integer range, generate a random number within it
function randomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * @api {get} /user Get a user details
 * @apiName getUser
 * @apiGroup authorised
 *
 * @apiSuccess {User} user User object
 */
exports.getUser = function(req, res) {
    if (typeof req.user.id === 'undefined' || req.user.id == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = User.findOne({
        _id : req.user.id
    });

    query.exec(function(error, user) {
        if(error) {
            res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else {
            res.status(common.StatusMessages.GET_SUCCESS.status).json({
                message: common.StatusMessages.GET_SUCCESS.message, result: user});
        }
    })
};


/**
 * @api {put} /user Update a users details
 * @apiName updateUser
 * @apiGroup authorised
 *
 * @apiSuccess {User} user Updated user object (at this time, only 'lastOpenedWall' and 'defaultEmail')
 */
exports.updateUser = function(req, res) {

    if (typeof req.user.id === 'undefined' || req.user.id == null
        || typeof req.body.user === 'undefined' || req.body.user == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = User.findOne({
        _id : req.user.id
    });

    query.exec(function(error, user) {
        if(error) {
            res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                message: common.StatusMessages.UPDATE_ERROR.message, result: error});
        }
        else {
            user.lastOpenedWall = req.body.user.lastOpenedWall;
            user.defaultEmail = req.body.user.defaultEmail;
            user.save();
            res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                message: common.StatusMessages.UPDATE_SUCCESS.message, result: user});
        }
    })
};

/**
 * @api {post} /wall Create a new wall with generated pin number
 * @apiName createWall
 * @apiGroup authorised
 *
 * @apiParam {String} label A label for the new wall.
 *
 * @apiSuccess {Wall} wall Newly created wall
 *
 */
exports.createWall = function(req, res) {

    // Find a pin that is not already used
    var newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
    while(redisClient.exists(newPin) === 1) {
        newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
    }

    // Create a new Wall model and include the pin
    var newWall = new Wall({
        pin: newPin,
        label: req.body.label,
        theme: req.body.theme,
        createdBy: req.user.id,
        organisers: [req.user.id]
    });

    newWall.save(function(error, wall) {
        if (error) {
            res.status(common.StatusMessages.CREATE_ERROR.status).json({
                message: common.StatusMessages.CREATE_ERROR.message, result: error});
        }
        else {
            // Save the new pin and wall ID to redis
            redisClient.set(newPin, wall.id);
            redisClient.EXPIRE(newPin, common.Constants.WALL_EXPIRATION_SECONDS);
            mm.setup(wall._id, req.user.nickname);
            res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
                message: common.StatusMessages.CREATE_SUCCESS.message,
                result: wall
            });
        }
    })
};

/**
 * @api {put} /wall Update a wall details
 * @apiName updateWall
 * @apiGroup authorised
 *
 * @apiSuccess {Wall} wall Updated wall object
 */
exports.updateWall = function(req, res) {

    if (typeof req.body.wall === 'undefined' || req.body.wall == null ) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.body.wall._id
    });

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                message: common.StatusMessages.UPDATE_ERROR.message, result: error});
        } else {
            if (!wall.closed && req.body.wall.closed) {     // Wall has been closed (locked)
                // Expire the pin
                if (req.body.wall.closed) {
                    redisClient.EXPIRE(req.body.wall.pin, 1);
                    req.body.wall.pin = '0000';
                    mm.removeWall(req.body.wall._id);
                }

                wall.closed = true;

                //send an email to the wall creator with the permalink.
                /*
                console.log('--> updateWall: sending export link: targetemail: ' + req.body.wall.targetEmail);
                sendExportLinkToOwner(wall.createdBy, req.body.wall.targetEmail).then(function () {
                    res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                        message: common.StatusMessages.UPDATE_SUCCESS.message,
                        result: wall
                    });
                });
                */

            } else if (wall.closed && !req.body.wall.closed) {  // Wall has been opened (unlocked)
                // Choose a fresh pin
                var newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
                while(redisClient.exists(newPin) === 1) {
                    newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
                }
                wall.pin = newPin;
                wall.closed = false;
            }
            mm.statusUpdate(wall._id, 'none');
            wall.save();
            res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                message: common.StatusMessages.UPDATE_SUCCESS.message, result: wall});
        }
    });
};


function sendExportLinkToOwner(userid, targetEmail) {

    return new Promise(function(resolve, reject) {
        var userquery = User.findOne({_id: userid});
        userquery.exec(function (err, user) {
            if (err) {
                //handle error
                console.log('--> sendExportLinkToOwner: user find error');
            }

            if (user != null) {
                console.log('--> user search - got results');

                var host;
                if (process.env.STATIC_FOLDER === 'src') {
                    host = 'http://' + process.env.HOST_NAME + ':' + process.env.PORT;
                } else {
                    host = 'http://' + process.env.HOST_NAME;
                }

                var mail = {
                    from: process.env.POSTMARK_USER,
                    to: targetEmail,
                    subject: 'Talkwall export',
                    text: 'Your last wall is now closed.\n\nYou can view an exported version of it via this link: '+host+'/#/export?wid='+user.lastOpenedWall+'\n\nThe Talkwall team.',
                    html: 'Your last wall is now closed.<br><br>You can view an exported version of it via this link: <a href="'+host+'/#/export?wid='+user.lastOpenedWall+'">'+host+'/#/export?wid='+user.lastOpenedWall+'</a><br><br>The Talkwall team'
                };

                //create a promise that holds the send email operation
                utilities.sendMail(mail).then(function(emailStatus) {
                    //nullify last wall id
                    user.lastOpenedWall = null;
                    user.save(function(error, newUser) {
                        if (error) {
                            //handle error
                            console.log('--> sendExportLinkToOwner: user save error');
                        }
                            
                        resolve();
                    });
                });
            } else {
                //handle error
                console.log('--> sendExportLinkToOwner: user null');
            }
        });

    });
}


/**
* @api {put} /wall/close/:wall_id Close a wall
* @apiName closeWall
* @apiGroup authorised
*
*/
exports.closeWall = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null ) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOneAndUpdate({
        _id : req.params.wall_id
    }, {closed: true}, { new: true });

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                message: common.StatusMessages.UPDATE_ERROR.message, result: error});
        } else {
            redisClient.EXPIRE(wall.pin, 1);
            mm.removeWall(wall._id);
            console.log('--> closeWall: sending export link');
            sendExportLinkToOwner(wall.createdBy, req.body.targetEmail).then(function() {
                res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                    message: common.StatusMessages.UPDATE_SUCCESS.message});
            });
        }
    })
};

/**
 * @api {get} /change Notify change of question
 * @apiName changeQuestion
 * @apiGroup authorised
 *
 */
exports.notifyChangeQuestion = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
    || typeof req.params.question_id === 'undefined' || req.params.question_id == null
    || typeof req.params.previous_question_id === 'undefined' || req.params.previous_question_id == null
    || typeof req.params.nickname === 'undefined' || req.params.nickname == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }
    if (req.params.previous_question_id !== 'none') {
        mm.removeUserFromQuestion(req.params.wall_id, req.params.previous_question_id, req.params.nickname, true);
    }
    mm.addUserToQuestion(req.params.wall_id, req.params.question_id, req.params.nickname, true);
    mm.statusUpdate(req.params.wall_id, req.params.question_id);
    res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
        message: common.StatusMessages.UPDATE_SUCCESS.message});
};


/**
 * @api {get} /disconnect Disconnect teacher from a wall with pin
 *
 * @apiName disconnectWall
 * @apiGroup authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get
 * @apiParam {String} nickname Connecting client's nickname
 *
 */
exports.disconnectWall = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null
        || typeof req.params.nickname === 'undefined' || req.params.nickname == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.params.wall_id,
        pin : { $gte: 0 }       // Wall is not available to clients if pin is -1
    }).lean();

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.CLIENT_DISCONNECT_ERROR.status).json({
                message: common.StatusMessages.CLIENT_DISCONNECT_ERROR.message, result: error});
        }
        else {
            // Remove nickname from the wall users list (message manager)
            mm.removeUserFromQuestion(wall._id, req.params.question_id, req.params.nickname, true);
            mm.removeUserFromWall(wall._id, req.params.nickname, true);
            res.status(common.StatusMessages.CLIENT_DISCONNECT_SUCCESS.status).json({
                message: common.StatusMessages.CLIENT_DISCONNECT_SUCCESS.message, result: wall});
        }
    });

};


/**
 * @api {delete} /wall Delete a wall   (ONLY USED FOR TESTING. Also deletes questions!)
 * @apiName deleteWall
 * @apiGroup authorised
 *
 * @apiParam {String} id ID of the wall to delete
 *
 */
exports.deleteWall = function(req, res) {

    if (typeof req.params.id === 'undefined' || req.params.id == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.params.id
    });

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.DELETE_ERROR.status).json({
                message: common.StatusMessages.DELETE_ERROR.message, result: error});
        }
        else {
            redisClient.expire(wall.pin, 1, function(error, result) {
                if(result !== null) {
                    wall.remove();
                    res.status(common.StatusMessages.DELETE_SUCCESS.status).json({
                        message: common.StatusMessages.DELETE_SUCCESS.message});
                }
            });
        }
    })

};

/**
 * @api {get} /walls Get all walls (limited details) for a user
 * @apiName getWalls
 * @apiGroup authorised
 *
 * @apiSuccess {Array<Wall>} walls List of walls found
 */
exports.getWalls = function(req, res) {
    var query = Wall.find({
        'organisers' : req.user.id,
        'deleted': false
    // }, '-createdBy -questions').lean();
    });

    query.exec(function(error, walls) {
        if(error) {
            res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else {
            res.status(common.StatusMessages.GET_SUCCESS.status).json({
                message: common.StatusMessages.GET_SUCCESS.message, result: walls});
        }
    })
};

/**
 * @api {get} /wall Get a wall details
 * @apiName getWallAuthorised
 * @apiGroup authorised
 *
 * @apiParam {String} id ID of the wall to get
 *
 * @apiSuccess {Wall} wall Wall object
 */
exports.getWall = function(req, res) {
    if (typeof req.params.id === 'undefined' || req.params.id == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.params.id
    });

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else if (wall !== null) {
            wall.lastOpenedAt = new Date();
            redisClient.get(wall.pin, function(error, redis_wall_id) {
                if(redis_wall_id === null || wall.pin === '0000') {
                    // Pin has expired while we were away or deliberately - Reallocate a pin to this wall
                    // Find a pin that is not already used
                    var newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
                    while (redisClient.exists(newPin) === 1) {
                        newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
                    }
                    redisClient.set(newPin, wall._id);
                    redisClient.EXPIRE(newPin, common.Constants.WALL_EXPIRATION_SECONDS);
                    wall.pin = newPin;
                    wall.save();
                }
                User.findOne({_id: req.user.id}, function (error, user) {
                    if (error) {
                        res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                            message: common.StatusMessages.UPDATE_ERROR.message, result: error
                        });
                    } else {
                        mm.setup(wall._id, user.nickname);
                        //mm.addUserToQuestion(wall._id, '', user.nickname, true);
                        //mm.putUpdate(wall.id, 'none', '', null, true);
                        mm.statusUpdate(wall._id, 'none');
                        if (user.recentWalls.length === 4) {
                            user.recentWalls.pop();
                        }
                        user.recentWalls.unshift(wall._id);
                        user.save();
                        res.status(common.StatusMessages.GET_SUCCESS.status).json({
                            message: common.StatusMessages.GET_SUCCESS.message, result: wall
                        });
                    }
                });
            });
        }
    })
};


exports.getQuestionContributors = function(req, res) {
    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.params.wall_id
    });

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else if (wall !== null) {
            for (var i = 0; i < wall.questions.length; i++) {
                if ((wall.questions[i]._id).toString() === req.params.question_id) {
                    res.status(common.StatusMessages.GET_SUCCESS.status).json({
                        message: common.StatusMessages.GET_SUCCESS.message, result: wall.questions[i].contributors});
                }
            }

            res.status(common.StatusMessages.GET_SUCCESS.status).json({
                message: common.StatusMessages.GET_SUCCESS.message, result: null});
        }
    })
};

/**
 * @api {post} /question Create a new question
 * @apiName createQuestion
 * @apiGroup authorised
 *
 * @apiSuccess {Question} question Newly created question
 */
exports.createQuestion = function(req, res) {

    if (typeof req.body.wall_id === 'undefined' || req.body.wall_id == null
        || typeof req.body.question.label === 'undefined' || req.body.question.label == null ){
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.body.wall_id
    });

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.CREATE_ERROR.status).json({
                message: common.StatusMessages.CREATE_ERROR.message, result: error});
        }
        else {
            var newQuestion = new Question(req.body.question);
            wall.questions.push(newQuestion);
            var qindex = wall.questions.length-1;
            wall.save(function(error, wall) {
                if (error) {
                    res.status(common.StatusMessages.CREATE_ERROR.status).json({
                        message: common.StatusMessages.CREATE_ERROR.message, result: error});
                } else {
                    mm.statusUpdate(req.body.wall_id, 'none');
                    res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
                        message: common.StatusMessages.CREATE_SUCCESS.message, result: wall.questions[qindex]});
                }
            });

        }
    })
};

/**
 * @api {put} /question Update a question
 * @apiName updateQuestion
 * @apiGroup authorised
 *
 */
exports.updateQuestion = function(req, res) {

    if (typeof req.body.wall_id === 'undefined' || req.body.wall_id == null
        || typeof req.body.question === 'undefined' || req.body.question == null ) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOneAndUpdate( {
        _id : req.body.wall_id,
        "questions._id": req.body.question._id
    }, { "questions.$" : req.body.question }, { new: true });

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                message: common.StatusMessages.UPDATE_ERROR.message, result: error});
        } else {
            mm.statusUpdate(wall._id, 'none');
            res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                message: common.StatusMessages.UPDATE_SUCCESS.message, result: wall});
        }
    })
};

/**
 * @api {delete} /question Delete a question
 * @apiName deleteQuestion
 * @apiGroup authorised
 *
 */
exports.deleteQuestion = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null ) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.update(
        { _id : req.params.wall_id },
        { $pull: { questions : { _id: req.params.question_id } } },
        { new: true } );

    query.exec(function(error, wall) {
        if(error) {
            res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                message: common.StatusMessages.UPDATE_ERROR.message, result: error});
        } else {
            mm.statusUpdate(req.params.wall_id, 'none');
            res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                message: common.StatusMessages.UPDATE_SUCCESS.message, result: wall});
        }
    })
};


/**
 * @api {post} /messageteacher Create a new message and add it to the Question
 * @apiName createMessage
 * @apiGroup authorised
 *
 * @apiSuccess {Message} message Newly created message
 */
exports.createMessage = function(req, res) {

    if (typeof req.body.message === 'undefined' || req.body.message == null
        || typeof req.body.wall_id === 'undefined' || req.body.wall_id == null
        || typeof req.body.nickname === 'undefined' || req.body.nickname == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    // Create a new Message with the supplied object, including board properties   *** Not vetted!! :S
    var newMessage = new Message(req.body.message);
    newMessage.save(function (error, message) {
        if (error) {
            res.status(common.StatusMessages.CREATE_ERROR.status).json({
                message: common.StatusMessages.CREATE_ERROR.message, result: error
            });
        }
        else {
            // Update the message manager to notify other clients
            mm.postUpdate(req.body.wall_id, message.question_id, req.body.nickname, message, 'create', true);

            // Update the question with this new message, and return
            Wall.findOneAndUpdate({
                '_id': req.body.wall_id,
                'questions._id': req.body.message.question_id
            }, { $push: { "questions.$.messages" : message}, $addToSet: { "questions.$.contributors" : req.body.nickname }}, function(error, wall) {
                if(error) {
                    res.status(common.StatusMessages.CREATE_ERROR.status).json({
                        message: common.StatusMessages.CREATE_ERROR.message
                    });
                } else {
                    res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
                        message: common.StatusMessages.CREATE_SUCCESS.message, result: message
                    });
                }
            });
        }
    })


};


/**
 * @api {put} /messageteacher Edit a message by submitting a Message object and pin
 * @apiName updateMessages
 * @apiGroup authorised
 *
 */
exports.updateMessages = function(req, res) {

    if (typeof req.body.messages === 'undefined' || req.body.messages == null
        || typeof req.body.wall_id === 'undefined' || req.body.wall_id == null
        || typeof req.body.controlString === 'undefined' || req.body.controlString == null
        || typeof req.body.nickname === 'undefined' || req.body.nickname == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var multiUpdatePromise = [];
    req.body.messages.forEach(function(message) {    // Collect Fixtures for the user and include in return

        var p = new Promise(function(resolve, reject) {
            var query = Message.findOneAndUpdate({ _id: message._id }, message, {new: true});

            query.exec(function (err, updated_message) {
                if (err) {
                    reject(err);
                }
                // Update the message manager to notify other clients
                if (req.body.controlString !== 'none') {
                    mm.postUpdate(req.body.wall_id, updated_message.question_id, req.body.nickname, updated_message, req.body.controlString, true);
                }
                resolve(updated_message);
            });
        });
        multiUpdatePromise.push(p);
    });

    Promise.all(multiUpdatePromise).then(function(messages) {
        res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
            message: common.StatusMessages.UPDATE_SUCCESS.message, result: messages
        });
    }).catch(function(err) {
        res.status(common.StatusMessages.UPDATE_ERROR.status).json({
            message: common.StatusMessages.UPDATE_ERROR.message, result: error
        });
    });

};



exports.createTestUser = function() {

    User.find().exec(function (err, users) {
        if (users.length === 0) {
            var newUser = new User();
            newUser.defaultEmail = "abc@abc.net";
            newUser.local.apikey = 'abcdef';
            newUser.nickname = 'teacher';
            newUser.save();
            console.log("*** Test User created");
        } else {
            console.log("*** Test User already exists");
        }
    })
};


/**
 * @api {get} /poll Respond to this call with any changed messages and status
 *
 * @apiName poll
 * @apiGroup non-authorised
 *
 * @apiParam {String} wall_id ID of the wall to get
 * @apiParam {String} question_id ID of the question to get.
 *                      Can be 'none' if we are only polling for status
 * @apiParam {String} previous_question_id ID of the previous question to assist removal from polling when changing question
 *                      Can be 'none' if not changing questions.
 * @apiParam {String} nickname Connecting client's nickname
 * @apiParam {String} control type of poll ('new', 'change', 'poll')
 *
 */
exports.poll = function(req, res) {

    if (typeof req.params.wall_id === 'undefined' || req.params.wall_id == null
        || typeof req.params.question_id === 'undefined' || req.params.question_id == null
        || typeof req.params.previous_question_id === 'undefined' || req.params.previous_question_id == null
        || typeof req.params.nickname === 'undefined' || req.params.nickname == null
        || typeof req.params.controlString === 'undefined' || req.params.controlString == null) {
        res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    if (req.params.controlString === 'change' && req.params.previous_question_id !== 'none') {
        // We are changing questions, so remove the user from previous question and add them to the new one
        mm.removeUserFromQuestion(req.params.wall_id, req.params.previous_question_id, req.params.nickname, true);
        mm.addUserToQuestion(req.params.wall_id, req.params.question_id, req.params.nickname, true);
    } else if (req.params.controlString === 'new' && req.params.question_id !== 'none') {
        // We are entering for the first time, so add the user
        mm.addUserToQuestion(req.params.wall_id, req.params.question_id, req.params.nickname, true);
    }

    // Return an update to the user
    var update = mm.getUpdate(req.params.wall_id, req.params.question_id, req.params.nickname, true);
    res.status(common.StatusMessages.POLL_SUCCESS.status)
        .json({message: common.StatusMessages.POLL_SUCCESS.message, result: update});

};
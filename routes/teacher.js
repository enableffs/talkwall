/**
 * Created by richardnesnass on 02/06/16.
 */

var common = require('../config/common');
var mm = require('../config/message_manager').mm;
var redisClient = require('../config/redis_database').redisClient;
var Wall = require('../models/wall');
var Question = require('../models/question');
var User = require('../models/user');


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
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = User.findOne({
        _id : req.user.id
    });

    query.exec(function(error, user) {
        if(error) {
            return res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else {
            return res.status(common.StatusMessages.GET_SUCCESS.status).json({
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
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = User.findOne({
        _id : req.user.id
    });

    query.exec(function(error, user) {
        if(error) {
            return res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                message: common.StatusMessages.UPDATE_ERROR.message, result: error});
        }
        else {
            user.lastOpenedWall = req.body.user.lastOpenedWall;
            user.defaultEmail = req.body.user.defaultEmail;
            user.save();
            return res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
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
        createdBy: req.user.id
    });

    newWall.save(function(error, wall) {
        if (error) {
            return res.status(common.StatusMessages.CREATE_ERROR.status).json({
                message: common.StatusMessages.CREATE_ERROR.message, result: error});
        }
        else {
            // Save the new pin and wall ID to redis
            redisClient.set(newPin, wall.id);
            redisClient.EXPIRE(newPin, common.Constants.WALL_EXPIRATION_SECONDS);
            User.findOneAndUpdate( { _id: req.user.id }, { lastOpenedWall : wall.id }, function(error, user) {
                if(error) {
                    return res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                        message: common.StatusMessages.UPDATE_ERROR.message, result: error});
                } else {
                    return res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
                        message: common.StatusMessages.CREATE_SUCCESS.message,
                        result: wall
                    });
                }
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
 * status: {
 *              select_question_id: "",
 *              close_wall: false
 *          }
 */
exports.updateWall = function(req, res) {

    if (typeof req.body.wall === 'undefined' || req.body.wall == null
        || typeof req.body.nickname === 'undefined' || req.body.nickname == null
        || typeof req.body.status === 'undefined' || req.body.status == null ){
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOneAndUpdate({
        _id : req.body.wall._id
    }, req.body.wall, { new: true });

    query.exec(function(error, wall) {
        if(error) {
            return res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                message: common.StatusMessages.UPDATE_ERROR.message, result: error});
        }
        else {
            if (req.body.status.close_wall) {       // Close this wall to clients by expiring the pin
                redisClient.EXPIRE(wall.pin, 1);
                wall.pin = -1;
                wall.save();
            }
            if ( typeof req.body.status.select_question_id !== 'undefined' && req.body.status.select_question_id !== "" ) {
                mm.putUpdate(wall._id, req.body.status.select_question_id, req.body.nickname, null, status)
            }
            return res.status(common.StatusMessages.UPDATE_SUCCESS.status).json({
                message: common.StatusMessages.UPDATE_SUCCESS.message, result: wall});
        }
    })
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
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.params.id
    });

    query.exec(function(error, wall) {
        if(error) {
            return res.status(common.StatusMessages.DELETE_ERROR.status).json({
                message: common.StatusMessages.DELETE_ERROR.message, result: error});
        }
        else {
            redisClient.expire(wall.pin, 1, function(error, result) {
                if(result !== null) {
                    wall.remove();
                    return res.status(common.StatusMessages.DELETE_SUCCESS.status).json({
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
        'createdBy' : req.user.id
    }, '-createdBy -questions').lean();

    query.exec(function(error, walls) {
        if(error) {
            return res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else {
            return res.status(common.StatusMessages.GET_SUCCESS.status).json({
                message: common.StatusMessages.GET_SUCCESS.message, result: walls});
        }
    })
};

/**
 * @api {get} /wall Get a wall details
 * @apiName getWall
 * @apiGroup authorised
 *
 * @apiParam {String} id ID of the wall to get
 *
 * @apiSuccess {Wall} wall Wall object
 */
exports.getWall = function(req, res) {
    if (typeof req.params.id === 'undefined' || req.params.id == null) {
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.params.id
    });

    query.exec(function(error, wall) {
        if(error) {
            return res.status(common.StatusMessages.GET_ERROR.status).json({
                message: common.StatusMessages.GET_ERROR.message, result: error});
        }
        else {
            if (wall !== null && wall.pin === -1) {                      // Reallocate a pin to this wall if it was previously expired
                // Find a pin that is not already used
                var newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
                while(redisClient.exists(newPin) === 1) {
                    newPin = randomNumberInRange(common.Constants.MINIMUM_PIN, common.Constants.MAXIMUM_PIN);
                }
                wall.pin = newPin;
                wall.save();
            }
            User.findOneAndUpdate( { _id: req.user.id }, { lastOpenedWall : wall.id }, function(error, user) {
                if(error) {
                    return res.status(common.StatusMessages.UPDATE_ERROR.status).json({
                        message: common.StatusMessages.UPDATE_ERROR.message, result: error});
                } else {
                    return res.status(common.StatusMessages.GET_SUCCESS.status).json({
                        message: common.StatusMessages.GET_SUCCESS.message, result: wall});
                }
            });
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
        return res.status(common.StatusMessages.PARAMETER_UNDEFINED_ERROR.status)
            .json({message: common.StatusMessages.PARAMETER_UNDEFINED_ERROR.message});
    }

    var query = Wall.findOne({
        _id : req.body.wall_id
    });

    query.exec(function(error, wall) {
        if(error) {
            return res.status(common.StatusMessages.CREATE_ERROR.status).json({
                message: common.StatusMessages.CREATE_ERROR.message, result: error});
        }
        else {
            var newQuestion = new Question(req.body.question);
            wall.questions.push(newQuestion);
            wall.save(function(error, wall) {
                if (error) {
                    return res.status(common.StatusMessages.CREATE_ERROR.status).json({
                        message: common.StatusMessages.CREATE_ERROR.message, result: error});
                } else {
                    return res.status(common.StatusMessages.CREATE_SUCCESS.status).json({
                        message: common.StatusMessages.CREATE_SUCCESS.message, result: wall});
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

};


exports.createTestUser = function() {

    User.find().exec(function (err, users) {
        if (users.length === 0) {
            var newUser = new User();
            newUser.defaultEmail = "abc@abc.net";
            newUser.local.apikey = 'abcdef';
            newUser.nickname = 'custom_teacher';
            newUser.save();
            console.log("*** Test User created");
        } else {
            console.log("*** Test User already exists");
        }
    })
};
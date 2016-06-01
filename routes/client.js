/**
 * Created by richardnesnass on 31/05/16.
 */

var common = require('../config/common.js');
var mm = require('../config/message_manager').mm;

exports.poll = function(req, res) {

    var result = mm.getUpdate(req.body.question_id, req.body.user_id, req.body.message_ids, req.body.status);
    return res.status(common.StatusMessages.POLL_SUCCESS.status).json({message: common.StatusMessages.POLL_SUCCESS.message, result: result});

};

exports.connect = function(req, res) {

    var userids = [];
    userids.push(req.body.user_id);

    mm.addUsers(req.body.question_id, userids);
    return res.status(common.StatusMessages.CLIENT_CONNECT_SUCCESS.status).json({message: common.StatusMessages.CLIENT_CONNECT_SUCCESS.message});

};
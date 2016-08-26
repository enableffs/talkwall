/**
 * Created by jeremyt on 01/04/15.
 */

'use strict';

var common = require('../config/common.js');

/**
 * @api {get} /ping Answers a ping call
 * @apiName ping
 * @apiGroup Sync
 *
 */
exports.ping = function() {
    return function (req, res) {
        return res.status(common.StatusMessages.PING_OK.status).json({message: common.StatusMessages.PING_OK.message});
    }
};
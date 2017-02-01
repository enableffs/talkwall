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
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

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our message model
var messageSchema = Schema({
    question_id:    { type: Schema.Types.ObjectId, ref: 'Question', default: null},
    createdAt:      { type: Date, default: Date.now },
    text:           { type: String, default: "" },
    creator:        { type: String }, // nickname
    deleted:        { type: Boolean, default: false },
    origin: [
        {
            nickname:   { type: String },
            message_id: { type: String, default: "" }
        }
    ],
    edits: [
        {
            date:   { type: Date },
            text:   { type: String }
        }
    ],
    board:          Schema.Types.Mixed

    /*
        board:  {
            nickname: {                         here, 'nickname' should be dynamically allocated
                xpos:   { type: Number },
                ypos:   { type: Number },
                highlighted: { type: Boolean, default: false }
            }
        }

     */
});

module.exports = mongoose.model('Message', messageSchema);

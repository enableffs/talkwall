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
var Message = require('./message');
var Question = require('./question').schema;
var Schema = mongoose.Schema;

// define the schema for our message model
var wallSchema = Schema({
    pin:            { type: String },
    label:          { type: String },
    theme:          { type: String },
    createdAt:      { type: Date, default: Date.now },
    lastOpenedAt:   { type: Date, default: Date.now },
    createdBy:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    organisers:     [ { type: Schema.Types.ObjectId, ref: 'User', default: null } ],
    closed:         { type: Boolean, default: false },
    deleted:        { type: Boolean, default: false },
    trackLogs:      { type: Boolean, default: false },
    questions:      [Question],
    questionIndex: { type: Number, default: -1 }
});

wallSchema.pre('remove', function(next) {

    for(var i=0; i< this.questions.length; i++) {
        Message.remove({ _id: { $in: this.questions[i].messages } }).exec(function(error, result) {
        });
    }
    next();


});

module.exports = mongoose.model('Wall', wallSchema);

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

var userSchema = Schema({

    local:
    {
        apikey:     String,
        email:      String,
        name:       String,
        createdAt:  { type: Date, default: Date.now },
        lastLogin:  { type: Date }
    },
    facebook:
    {
        id:         String,
        token:      String,
        email:      String,
        name:       String,
        createdAt:  { type: Date, default: Date.now },
        lastLogin:  { type: Date }
    },
    google:
    {
        id:         String,
        token:      String,
        email:      String,
        name:       String,
        createdAt:  { type: Date, default: Date.now },
        lastLogin:  { type: Date }
    },
    nickname:       { type: String, default: 'teacher' },
    defaultEmail:   { type: String, unique: false },
    recentWalls:    [ { type: Schema.Types.ObjectId, ref: 'Wall', default: null} ],
    helpViewed:     { type: Boolean, default: false }
});

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
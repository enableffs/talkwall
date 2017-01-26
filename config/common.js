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

'use strict';

exports.Constants = {
    WALL_EXPIRATION_SECONDS: 2592000, // 1 month                        // Redis expiry time for PIN numbers
    TOKEN_EXPIRATION: 86400, //24hrs
    MINIMUM_PIN: 1000,
    MAXIMUM_PIN: 9999,
    POLL_USER_EXPIRY_TIME_MINUTES: 2,  // 30 seconds = 30000            // Remove a user's MM queue if this idle period is exceeded
    TERMINATE_MESSAGE_MANAGER_MINUTES: 10080,  // 1440 = 24 hours  10080 = 7 days   // Remove an entire MM wall if this idle period is exceeded
    TERMINATE_MESSAGE_MANAGER_CHECK_SECONDS: 60   // 600 = 10 minutes   // How often to check for the idle period expiry
};

exports.LogType = {
    mc: 'CreateMessage',
    me: 'EditMessage',
    mp: 'PinMessage',
    mup: 'UnPinMessage',
    md: 'DeleteMessage',
    mh: 'HighlightMessage',
    muh: 'UnHighlightMessage',
    mm: 'MoveMessage',
    tc: 'CreateTask',
    te: 'EditTask',
    td: 'DeleteTask'
};

exports.trackedOrganiserWalls = [
    'richardn@uio.im'
];

exports.StatusMessages = {
    PING_OK: {
        status: 200,
        message: 'Server alive'
    },
    INVALID_USER: {
        status: 400,
        message: 'Invalid User'
    },
    LOGIN_SUCCESS: {
        status: 200,
        message: 'Login successfull'
    },
    DATABASE_ERROR: {
        status: 400,
        message: 'Database operation error'
    },
    USER_LOGOUT_SUCCESS: {
        status: 200,
        message: 'Logout successfull'
    },
    USER_LOGOUT_ERROR: {
        status: 400,
        message: 'Logout error'
    },
    POLL_SUCCESS: {
        status: 200,
        message: 'Poll successful'
    },
    CLIENT_CONNECT_SUCCESS: {
        status: 200,
        message: 'Client connection successful'
    },
    CLIENT_CONNECT_ERROR: {
        status: 400,
        message: 'Client connection error'
    },
    CLIENT_DISCONNECT_SUCCESS: {
        status: 200,
        message: 'Client disconnection successful'
    },
    CLIENT_DISCONNECT_ERROR: {
        status: 400,
        message: 'Client disconnection error'
    },
    PARAMETER_UNDEFINED_ERROR: {
        status: 400,
        message: 'Request parameter undefined'
    },
    CREATE_SUCCESS: {
        status: 200,
        message: 'Model creation successful'
    },
    CREATE_ERROR: {
        status: 400,
        message: 'Model creation error'
    },
    UPDATE_SUCCESS: {
        status: 200,
        message: 'Model update successful'
    },
    UPDATE_ERROR: {
        status: 400,
        message: 'Model update error'
    },
    GET_SUCCESS: {
        status: 200,
        message: 'Model get successful'
    },
    GET_ERROR: {
        status: 400,
        message: 'Model get error'
    },
    DELETE_SUCCESS: {
        status: 200,
        message: 'Model delete successful'
    },
    DELETE_ERROR: {
        status: 400,
        message: 'Model delete error'
    },
    PIN_DOES_NOT_EXIST: {
        status: 204,
        message: 'Pin code does not exist'
    },
    PIN_RETRIEVAL_ERROR: {
        status: 400,
        message: 'Pin retrieval error'
    },
    INVITE_EMAIL_SEND_SUCCESS: {
        status: 200,
        message: 'An email has been sent to the email address you provided. '
    }
};
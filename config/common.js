'use strict';

exports.Constants = {
    WALL_EXPIRATION_SECONDS: 2592000, // 1 month
    TOKEN_EXPIRATION: 86400, //24hrs
    MINIMUM_PIN: 1000,
    MAXIMUM_PIN: 9999
};

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
        status: 400,
        message: 'Pin code does not exist'
    },
    PIN_RETRIEVAL_ERROR: {
        status: 400,
        message: 'Pin retrieval error'
    }
};
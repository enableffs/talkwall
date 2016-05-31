'use strict';

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
    }
};
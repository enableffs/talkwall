/**
 * This message manager keeps track of which messages need to be updated on a client polling round
 * It also notifies a client of change of status
 */

var extend = require('util')._extend;

var Mm = function() {
    this.data = {};

    //  data[question][user].messages : Array   contains all message IDs that have been modified
    //  data[question][user].status : Object    contains any status messages to send to the user
};

/**
 * Add additional users to the manager
 *
 * @param {string} question_id
 * @param {[string]} user_ids
 */
Mm.prototype.addUsers = function(question_id, user_ids) {

    // Create the question reference first, if not already there
    if (!this.data.hasOwnProperty(question_id)) {
        this.data[question_id] = {};
    }

    // Add a new user structure to this question
    for(var i = 0; i < user_ids.length; i++) {
        this.data[question_id][user_ids[i]] = {
            status: {
                question_id: question_id
            },
            messages: []
        }
    }
};

/**
 * Remove users from the manager
 *
 * @param {string} question_id
 * @param {Array} user_ids
 */
Mm.prototype.removeUsers = function(question_id, user_ids) {
    for(var i = 0; i < user_ids.length; i++) {
        delete this.data[question_id][user_ids[i]];
    }
};


/**
 * Update a question's status and message called from a particular user and return any updates made by other users
 *
 * @param {string} question_id
 * @param {string} user_id              the particular calling user
 * @param {Array} edited_message_ids    the message ids edited by the calling user
 * @param {Object} status
 */
Mm.prototype.getUpdate = function(question_id, user_id, edited_message_ids, status) {

    // Reference to my pending updates and any change to status
    var my_update = {
        messages: this.data[question_id][user_id]['messages'],
        status: this.data[question_id][user_id]['status']
    };

    // Make note of my changes in other users' lists on the same question
    if (edited_message_ids.length > 0) {
        for (var key in this.data[question_id]) {
            if (this.data[question_id].hasOwnProperty(key) && key !== user_id) {
                for (var i = 0; i < edited_message_ids.length; i++) {
                    this.data[question_id][key]['messages'].push(edited_message_ids[i]);
                }
            }
        }
    }

    // Reset my own update data.  Opportunity to set status values.
    this.data[question_id][user_id]['messages'] = [];
    this.data[question_id][user_id]['status'] = status;

    return my_update;
};

exports.mm = new Mm();
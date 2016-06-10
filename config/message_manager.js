/**
 * This message manager keeps track of which messages need to be updated on a client polling round
 * It also notifies a client of change of status
 */

var Mm = function() {
    this.data = {};

    //  data[question][user].messages : Array   contains all messages that have been modified
    //  data[question][user].status : Object    contains any status messages to send to the user
};

/**
 * Add additional users to the manager
 *
 * 'status' area reflects the 'present state'
 *      e.g. which question ID the client should be on after this poll
 *      e.g. the client nicknames currently connected to this question
 * 'messages' area reflects 'changed messages'
 *
 * @param {string} wall_id
 * @param {string} question_id (can be null)
 * @param {string} nickname
 */
Mm.prototype.addUser = function(wall_id, question_id, nickname) {

    // If question_id === null, add this nickname to the wall's connected_nicknames
    // If question_id !== null, also add this nickname to the question's polling 'messages' list

    // Create the wall reference first, if not already there and set up content
    if (!this.data.hasOwnProperty(wall_id)) {
        this.data[wall_id] = {
            status: {
                commands_to_server : {
                    select_question_id: question_id,
                    close_wall: false
                },
                connected_nicknames: []
            },
            messages: {}
        };
    }
    // Add the nickname if not already there
    if (this.data[wall_id].status['connected_nicknames'].indexOf(nickname) === -1) {
        this.data[wall_id].status['connected_nicknames'].push(nickname);
    }

    if(question_id !== "") {
        // Create the question reference first, if not already there
        if (!this.data[wall_id].messages.hasOwnProperty(question_id)) {
            this.data[wall_id].messages[question_id] = {};
        }
        this.data[wall_id].messages[question_id][nickname] = [];
    }
};

/**
 * Remove users from a question
 *
 * @param {string} wall_id
 * @param {string} question_id
 * @param {Array} nickname
 */
Mm.prototype.removeUser = function(wall_id, question_id, nickname) {
    // Remove this nickname from the question's polling 'messages' list
    if( typeof this.data[wall_id] !== 'undefined' &&
        typeof this.data[wall_id].messages[question_id][nickname] !== 'undefined') {
            delete this.data[wall_id].messages[question_id][nickname];
    }
};

/**
 * Remove users from the wall entirely
 *
 * @param {string} wall_id
 * @param {Array} nickname
 */
Mm.prototype.removeFromWall = function(wall_id, nickname) {
    // Remove this nickname from the wall's connected_nicknames
    var i = this.data[wall_id].status.connected_nicknames.indexOf(nickname);
    this.data[wall_id].status.connected_nicknames.splice(i, 1);
};

/**
 * Remove all users from the wall entirely
 *
 * @param {string} wall_id
 */
Mm.prototype.removeAllFromWall = function(wall_id) {
    // Remove all nicknames from the wall's connected_nicknames
    this.data[wall_id].status.connected_nicknames = [];
};

/**
 * Update a question's status and message called from a particular user
 *
 * @param {string} wall_id
 * @param {string} question_id
 * @param {string} nickname                         the particular calling user
 * @param {Array<Message>} edited_messages          the message objects edited by the calling user
 * @param {Object} status                           any change to the present status
 */
Mm.prototype.putUpdate = function(wall_id, question_id, nickname, edited_messages, status) {

    // Make note of my changes in other users' lists on the same question
    if (edited_messages !== null && edited_messages.length > 0) {
        var messages = this.data[wall_id].messages[question_id];
        for (var key in messages) {
            if (messages.hasOwnProperty(key) && key !== nickname) {
                for (var i = 0; i < edited_messages.length; i++) {
                    messages[key].push(edited_messages[i]);
                }
            }
        }
    }

    // Opportunity to set status values.
    if (status !== null) {
        if (status.commands_to_server.select_question_id !== "") {
            this.data[wall_id]['status'].commands_to_server.select_question_id = status.commands_to_server.select_question_id;
        }
        if (status.commands_to_server.close_wall) {
            this.data[wall_id]['status'].commands_to_server.close_wall = true;
            this.data[wall_id].status.connected_nicknames = [];

            // If re-opening the wall, reset 'closed' to false
        } else if (this.data[wall_id].status.connected_nicknames.length < 2) {
            this.data[wall_id]['status'].commands_to_server.close_wall = false;
        }
    }
};


/**
 * Return any updates made by other users
 *
 * @param {string} wall_id
 * @param {string} question_id
 * @param {string} nickname              the particular calling user's nickname
 */
Mm.prototype.getUpdate = function(wall_id, question_id, nickname) {

    // Reference to my pending updates and any change to status
    var my_update = {
        messages: this.data[wall_id].messages[question_id][nickname],
        status: this.data[wall_id]['status']
    };

    // Reset my own update data
    this.data[wall_id].messages[question_id][nickname] = [];

    return my_update;
};

exports.mm = new Mm();
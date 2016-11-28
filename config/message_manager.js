/**
 * This message manager keeps track of which messages need to be updated on a client polling round
 * It also notifies a client of change of status
 */

var common = require('../config/common.js');

var Mm = function() {
    this.data = {};

    //  data[question][user].messages : Array   contains all messages that have been modified
    //  data[question][user].status : Object    contains any status messages to send to the user
};

/**
 * Add additional users to the manager
 *
 * 'status' area reflects the last update Date made by teacher, teacher's current question, and the connected users
 *
 * 'messages' area reflects 'changed messages' for every nickname except the one making the change
 *
 * @param {string} wall_id
 * @param {string} question_id (can be 'none')
 * @param {string} nickname
 * @param {boolean} isTeacher
 */
Mm.prototype.addUser = function(wall_id, question_id, nickname, isTeacher) {

    // If question_id === 'none', add this nickname to the wall's connected_nicknames
    // If question_id !== 'none', also add this nickname to the question's polling 'messages' list

    // Create the wall reference first, if not already there and set up content
    if (!this.data.hasOwnProperty(wall_id)) {
        this.data[wall_id] = {
            status: {
                last_update: Date.now(),
                teacher_question_id: 'none',
                teacher_nickname: '',
                connected_nicknames: {}
            },
            messages: {}
        };
    }

    // Note which nickname belongs to the teacher
    if(isTeacher) {
        this.data[wall_id].status.teacher_nickname = nickname;
    }

    // Update the nickname and timestamp to the connected users list
    this.data[wall_id].status.connected_nicknames[nickname] = Date.now();


    // Create a message list for this user for a particular question
    if (question_id !== 'none') {
        // Create the question reference, if not already there
        if (!this.data[wall_id].messages.hasOwnProperty(question_id)) {
            this.data[wall_id].messages[question_id] = {};
        }
        this.data[wall_id].messages[question_id][nickname] = [];
    }
};

/**
 * Remove user from a question
 *
 * @param {string} wall_id
 * @param {string} question_id
 * @param {Array} nickname
 */
Mm.prototype.removeFromQuestion = function(wall_id, question_id, nickname) {
    // Remove this nickname from the question's polling 'messages' list
    if( typeof this.data[wall_id] !== 'undefined' &&
        typeof this.data[wall_id].messages[question_id][nickname] !== 'undefined') {
            delete this.data[wall_id].messages[question_id][nickname];
    }
};

/**
 * Remove user from a wall
 *
 * @param {string} wall_id
 * @param {Array} nickname
 */
Mm.prototype.removeFromWall = function(wall_id, nickname) {
    // Remove this nickname from the wall's connected_nicknames
    if( typeof this.data[wall_id] !== 'undefined') {
        if(this.data[wall_id].status.connected_nicknames.hasOwnProperty(nickname)) {
            delete this.data[wall_id].status.connected_nicknames[nickname];
        }
    }
};

/**
 * Remove all users from the wall entirely
 *
 * @param {string} wall_id
 */
Mm.prototype.removeAllFromWall = function(wall_id) {
    // Remove all nicknames from the wall's connected_nicknames
    if (this.data.hasOwnProperty(wall_id)) {
        this.data[wall_id].status.connected_nicknames = {};
    }
};

/**
 * Update a question's status and messages
 * Only an authorised user should send a status update
 *
 * @param {string} wall_id
 * @param {string} question_id                      question_id can be 'none' if the teacher has not changed questions
 * @param {string} nickname                         the particular calling user
 * @param {Array<Message>} edited_messages          the message objects edited by the calling user. null if no changes
 * @param {boolean} status_update                   wall status has changed (true | false).
 */
Mm.prototype.putUpdate = function(wall_id, question_id, nickname, edited_messages, status_update) {

    if (typeof this.data[wall_id] === 'undefined') {
        return;
    }

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

    // Opportunity to set status
    if (status_update) {
        if(question_id !== 'none') {
            this.data[wall_id]['status'].teacher_question_id = question_id;
        }
        this.data[wall_id]['status'].last_update = Date.now();
    }
};


/**
 * Return any updates made by other users
 *
 * @param {string} wall_id
 * @param {string} question_id           can be 'none' if requesting only status
 * @param {string} nickname              the particular calling user's nickname
 * @param {boolean} isTeacher            set to true if the caller is a teacher (admin)
 */
Mm.prototype.getUpdate = function(wall_id, question_id, nickname, isTeacher) {
    
    if (typeof this.data[wall_id] === 'undefined') {
        return null;
    }

    var nicknames = this.data[wall_id].status.connected_nicknames;

    // If I am a teacher, check for disconnected users as well
    if (isTeacher) {
        var timeNow = Date.now();
        for (var key in nicknames) {
            if ( nicknames.hasOwnProperty(key) && (timeNow - nicknames[key] > common.Constants.POLL_USER_EXPIRY_TIME)) {
                delete nicknames[key];
            }
        }
    }

    var messages = [];
    if(question_id !== 'none' && typeof this.data[wall_id].messages[question_id][nickname] !== 'undefined') {
        messages = this.data[wall_id].messages[question_id][nickname];
        // Reset my own update data
        this.data[wall_id].messages[question_id][nickname] = [];
    }

    // Update my poll timestamp
    nicknames[nickname] = Date.now();

    // Reference to my pending updates and any change to status
    return {
        messages: messages,
        status: this.data[wall_id]['status']
    }
};

exports.mm = new Mm();
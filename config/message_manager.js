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
 * This message manager keeps track of which messages need to be updated on a client polling round
 * It also notifies a client of change of status
 */

var common = require('../config/common.js');

var Mm = function() {
    this.data = {
        walls: {},
        total_talkwall_connections: 0
    };
    /* setTimeout(this.time, 5000); */
    /* Create a saving to database function here?
     */
    /* setInterval(() => {
        console.log(this.data.walls);
    }, 1000);
    console.log(this.data.walls); */
    //  data[question][user].messages : Array   contains all messages that have been modified
    //  data[question][user].status : Object    contains any status messages to send to the user
};

/* Mm.prototype.time = function(){
    var self = this;
    console.log(data.walls);
} */



/*

      Proposed new message manager structure  December 2016


{
	WALL_ID: {
		status: {
			last_updated: Date,
			teacher_current_question: String,
			teacher_nickname: String,
            connected_students: {
				NICKNAME: Date
			},
            total_talkwall_connections: Number
		},
		questions: {
			QUESTION_ID: {
				updated: {
					NICKNAME: {
						MESSAGE_ID: {
							board: {
								NICKNAME: {
									xpos: Number,
									ypos: Number,
									highlighted: Boolean
								}
							},
							text: String,
							deleted: Boolean
						}
					}
				},
				created: {
					NICKNAME: {
						MESSAGE_ID: {
							createdAt: Date,
							creator: String,
							origin: [{
								nickname: String,
								message_id: String
							}],
							board: {
								NICKNAME: {
									xpos: Number,
									ypos: Number,
									highlighted: Boolean
								}
							},
							text: String,
							deleted: Boolean
						}
					}
				}
			}
		}
	}
}


*/

Mm.prototype.pruneWalls = function() {
    /* MYNOTE: Memory gets reset here*/
    // If the wall is not used in a long time, this will clean its message manager from memory
    var self = this;
    var terminationCheck = function() {
        for (var wall_id in self.data.walls) {
            if (self.data.walls.hasOwnProperty(wall_id)) {
                var timeNow = Date.now();
                if (timeNow - self.data.walls[wall_id].status.last_access > (self.data.walls[wall_id].status.idleTerminationTime * 60000)) {
                    self.removeWall(wall_id);
                }
            }
        }

        setTimeout(function() {
            terminationCheck();
        }, common.Constants.TERMINATE_MESSAGE_MANAGER_CHECK_SECONDS * 1000)
    };

    terminationCheck();
};

/**
 * Set up the message manager
 *
 * 'status' area reflects the last update Date made by teacher, teacher's current question, and the connected users
 *
 * 'teacher/student/everyone' area will reflect 'changed messages' for every nickname except the one making the change
 * @param {string} wall_id
 * @param {string} nickname
 */
Mm.prototype.setup = function(wall_id, nickname) {

    if (!this.data.walls.hasOwnProperty(wall_id)) {
        this.data.walls[wall_id] = {
            status: {
                last_update: Date.now(),
                last_access: Date.now(),
                teacher_current_question: '',
                connected_teachers: {},
                connected_students: {},

                // This wall cache will be removed after a period of time (in minutes) without activity
                idleTerminationTime: common.Constants.TERMINATE_MESSAGE_MANAGER_MINUTES
            },
            questions: {}
        };
    }

    // The first user (only a teacher can run this) goes into the lists
    if (typeof this.data.walls[wall_id].status.connected_teachers[nickname] === 'undefined') {
        this.data.total_talkwall_connections++;
    }
    this.data.walls[wall_id].status.connected_teachers[nickname] = Date.now();

};

/**
 * Add additional users to a question
 *
 * @param {string} wall_id
 * @param {string} question_id (can be 'none')
 * @param {string} nickname
 * @param {boolean} isTeacher
 */
Mm.prototype.addUserToQuestion = function(wall_id, question_id, nickname, isTeacher) {

    // Possible that a client is here after the wall is closed, return gracefully
    if (!this.data.walls.hasOwnProperty(wall_id)) {
        return false;
    }

    // Create the question structure if it doesn't exist
    if (question_id !== 'none' && !this.data.walls[wall_id].questions.hasOwnProperty(question_id)) {
        this.data.walls[wall_id].questions[question_id] = {
            updated: {},
            created: {}
        };
    }

    // Update the connected user lists
    if (isTeacher) {
        if (typeof this.data.walls[wall_id].status.connected_teachers[nickname] === 'undefined') {
            this.data.total_talkwall_connections++;
        }
        this.data.walls[wall_id].status.connected_teachers[nickname] = Date.now();
    } else {
        if (typeof this.data.walls[wall_id].status.connected_students[nickname] === 'undefined') {
            this.data.total_talkwall_connections++;
        }
        this.data.walls[wall_id].status.connected_students[nickname] = Date.now();
    }

    // Add user to the question
    if (this.data.walls[wall_id].questions.hasOwnProperty(question_id)) {
        this.data.walls[wall_id].questions[question_id].updated[nickname] = {};
        this.data.walls[wall_id].questions[question_id].created[nickname] = {};
    }
    return true;
};

/**
 * Check that a student nickname is listed on the given wall
 *
 * @param {string} wall_id
 * @param {string} nickname
 */
Mm.prototype.userIsOnWall = function(wall_id, nickname) {
    return this.data.walls.hasOwnProperty(wall_id)
        && (this.data.walls[wall_id].status.connected_students.hasOwnProperty(nickname)
        || this.data.walls[wall_id].status.connected_teachers.hasOwnProperty(nickname));
};


/**
 * Check that a wall exists on the MM
 *
 * @param {string} wall_id
 */
Mm.prototype.wallExists = function(wall_id) {
    return this.data.walls.hasOwnProperty(wall_id);
};

/**
 * Remove user from a question
 *
 * @param {string} wall_id
 * @param {string} question_id
 * @param {string} nickname
 * @param {boolean} isTeacher
 */
Mm.prototype.removeUserFromQuestion = function(wall_id, question_id, nickname, isTeacher) {
    if (this.data.walls.hasOwnProperty(wall_id)
        && this.data.walls[wall_id].questions.hasOwnProperty(question_id)) {
            if (this.data.walls[wall_id].questions[question_id].created.hasOwnProperty(nickname)) {
                delete this.data.walls[wall_id].questions[question_id].created[nickname];
            }
            if (this.data.walls[wall_id].questions[question_id].updated.hasOwnProperty(nickname)) {
                delete this.data.walls[wall_id].questions[question_id].updated[nickname];
            }
    }
};

/**
 * Remove user from a wall
 *
 * @param {string} wall_id
 * @param {string} nickname
 * @param {boolean} isTeacher
 *
 */
Mm.prototype.removeUserFromWall = function(wall_id, nickname, isTeacher) {

    if (this.data.walls.hasOwnProperty(wall_id)) {

        // Remove user from all questions
        var qs = this.data.walls[wall_id].questions;
        for (var q in qs) {
            if (qs.hasOwnProperty(q)) {
                if (qs[q].created.hasOwnProperty(nickname)) {
                    delete qs[q].created[nickname];
                }
                if (qs[q].updated.hasOwnProperty(nickname)) {
                    delete qs[q].updated[nickname];
                }
            }
        }

        // Remove this nickname from the wall's connected users
        var clientType = isTeacher ? 'connected_teachers' : 'connected_students';
        if (this.data.walls[wall_id].status[clientType].hasOwnProperty(nickname)) {
            delete this.data.walls[wall_id].status[clientType][nickname];
            this.data.total_talkwall_connections--;
        }
    }
};

/**
 * Remove the wall entirely
 *
 * @param {string} wall_id
 */
Mm.prototype.removeWall = function(wall_id) {
    if (this.data.walls.hasOwnProperty(wall_id)) {

        // Allow connected clients some time to disconnect gracefully
        this.data.walls[wall_id].status.last_update = Date.now();

        var self = this;
        setTimeout(function() {
            if (self.data.walls.hasOwnProperty('wall_id')) {
	            var studentsOnWall = Object.keys(self.data.walls[wall_id].status.connected_students).length;
	            var teachersOnWall = Object.keys(self.data.walls[wall_id].status.connected_teachers).length;
	            self.data.total_talkwall_connections -= studentsOnWall;
	            self.data.total_talkwall_connections -= teachersOnWall;
	            delete self.data.walls[wall_id];
            }
        }, 10000);

    }
};

/**
 * Update a wall's status
 * Only an authorised user should send a status update
 *
 * @param {string} wall_id
 * @param {string} question_id
 *
 * question_id can be 'none' if the teacher wants students to refresh wall (e.g. on wall closure, new question added)
 */
Mm.prototype.statusUpdate = function(wall_id, question_id) {
    if (this.data.walls.hasOwnProperty(wall_id)) {
        this.data.walls[wall_id].status.last_update = Date.now();
        if (question_id !== 'none') {
            this.data.walls[wall_id].status.teacher_current_question = question_id;
        }
    }
};

/**
 * Update a message
 *
 * @param {string} wall_id
 * @param {string} question_id
 * @param {string} nickname                         the particular calling user
 * @param {object} updated_message                  the message object edited by the calling user. null if no changes
 * @param {string} controlString                    the type of update to be performed
 * @param {boolean} isTeacher                       the teacher is making this request
 */
Mm.prototype.postUpdate = function(wall_id, question_id, nickname, updated_message, controlString) {

    if (!this.data.walls.hasOwnProperty(wall_id) || !this.data.walls[wall_id].questions.hasOwnProperty(question_id)) {
        return;
    }

    function editUpdate(userQueue) {

        // Has an update to this message already been registered?  Further updates will overwrite..
        if (userQueue.hasOwnProperty(updated_message._id)) {
            userQueue[updated_message._id].text = updated_message.text;
            userQueue[updated_message._id].deleted = updated_message.deleted;
        } else {
            userQueue[updated_message._id] = {
                board: {},
                text: updated_message.text,
                deleted: updated_message.deleted,
                updateType: 'edit'
            }
        }
    }

    // Note that someone is using this wall
    this.data.walls[wall_id].status.last_access = Date.now();

    // Short reference to the question in question
    var thisQuestion = this.data.walls[wall_id].questions[question_id];
    var userQueue = null;

    // Make note of my changes in other users' lists on the same question
    switch(controlString) {

       /* // In this case an Organiser is deleting someone else's message
        case 'delete':
            for (var user3 in thisQuestion.updated) {

                // If the nickname is not our own, make a notification
                if (user3 !== nickname && thisQuestion.updated.hasOwnProperty(user3)) {
                    userQueue = thisQuestion.updated[user3];
                    editUpdate(userQueue);

                    // Update may already have position data, so mark it now as mixed data
                    userQueue[updated_message._id].updateType
                        = userQueue[updated_message._id].updateType === 'position' ? 'mixed' : 'edit';
                }
            }
            break;*/

        // Only the originator of a message can make a 'create' ( a new message )
        case 'create':
            for (var user in thisQuestion.created) {
                if (user !== nickname && thisQuestion.created.hasOwnProperty(user)) {
                    thisQuestion.created[user][updated_message._id] = updated_message;
                }
            }
            break;

        // Only the originator of a message can make an 'edit' ( change text or mark as deleted )
        case 'edit':

            for (var user2 in thisQuestion.updated) {

                // If the nickname is not our own, make a notification
                if (user2 !== nickname && thisQuestion.updated.hasOwnProperty(user2)) {
                    userQueue = thisQuestion.updated[user2];
                    editUpdate(userQueue);

                    // Update may already have position data, so mark it now as mixed data
                    userQueue[updated_message._id].updateType
                        = userQueue[updated_message._id].updateType === 'position' ? 'mixed' : 'edit';
                }
            }
            break;

        // Anyone can report position changes, but only the teacher will see them (spec as at December 2016)
        // 'position' calls arise from pinning / unpinning a message to board, highlight, move x and y position
        case 'position':

            for (var user3 in thisQuestion.updated) {

                // Make a notification to all.
                // This is necessary to prevent interference between wall messages depending on update / poll timing
                if (thisQuestion.updated.hasOwnProperty(user3)) {
                    userQueue = thisQuestion.updated[user3];

                    // Has an update to this message already been registered?
                    if (userQueue.hasOwnProperty(updated_message._id)) {

                        // Check if the updated message contains this nickname.
                        // Each user has their own nickname space on a message. A user may only remove their own nickname
                        if (updated_message.board.hasOwnProperty(nickname)) {
                            userQueue[updated_message._id].board[nickname] = updated_message.board[nickname];
                        } else {
                            delete userQueue[updated_message._id].board[nickname];
                        }

                        // Update may already have edit data, so mark it now as mixed data
                        userQueue[updated_message._id].updateType
                            = userQueue[updated_message._id].updateType === 'edit' ? 'mixed' : 'position';
                    } else {
                        //console.log('---Update to MM---: fresh update from ' + nickname + ' to ' + user3);
                        userQueue[updated_message._id] = {
                            board: updated_message.board,    // All users with this message on board need to be kept to account for those who remove it
                            text: null,
                            deleted: null,
                            updateType: 'position'
                        };
                    }

                }
            }


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
    
    if (typeof this.data.walls[wall_id] === 'undefined') {
        return {
            totalOnTalkwall: this.data.total_talkwall_connections,
            status: {
                last_update: Date.now(),
                last_access: null,
                teacher_current_question: 'none',
                connected_teachers: {},
                connected_students: {},
                expired: true
            },
            created: {},
            updated: {}
        }
    } else {

        var created = {};
        var updated = {};
        var connectedStudents = this.data.walls[wall_id].status.connected_students;
        var connectedTeachers = this.data.walls[wall_id].status.connected_teachers;

        // Check for disconnected users (done on the teacher cycle only). If a user has not been polling, remove their queue.
        if (isTeacher) {
            var timeNow = Date.now();
            for (var student in connectedStudents) {
                if (connectedStudents.hasOwnProperty(student) && (timeNow - connectedStudents[student] > (common.Constants.POLL_USER_EXPIRY_TIME_MINUTES * 60000))) {
                    this.removeUserFromWall(wall_id, student, false);
                }
            }
            for (var teacher in connectedTeachers) {
                if (nickname !== teacher && connectedTeachers.hasOwnProperty(teacher) && (timeNow - connectedTeachers[teacher] > (common.Constants.POLL_USER_EXPIRY_TIME_MINUTES * 60000))) {
                    this.removeUserFromWall(wall_id, teacher, true);
                }
            }
        }

        // Collect any new notifications and clear my queue
        if (question_id !== 'none') {
            var queue = this.data.walls[wall_id].questions[question_id].created;

            if (queue.hasOwnProperty(nickname)) {
                for (var message_id in queue[nickname]) {
                    if (queue[nickname].hasOwnProperty(message_id)) {
                        created[message_id] = queue[nickname][message_id];
                    }
                }
                queue[nickname] = {};
            }

            queue = this.data.walls[wall_id].questions[question_id].updated;

            if (queue.hasOwnProperty(nickname)) {
                for (var message_id2 in queue[nickname]) {
                    if (queue[nickname].hasOwnProperty(message_id2)) {
                        updated[message_id2] = queue[nickname][message_id2];
                    }
                }
                queue[nickname] = {};
            }
        }

        // Update my poll timestamp.  If I am not polling I will be removed from the Message Manager.
        var clientType = isTeacher ? 'connected_teachers' : 'connected_students';
        if (this.data.walls[wall_id].status[clientType].hasOwnProperty(nickname)) {
            this.data.walls[wall_id].status[clientType][nickname] = Date.now();
        }

        // Return my pending updates and any change to status
        return {
            totalOnTalkwall: this.data.total_talkwall_connections,
            status: this.data.walls[wall_id].status,
            created: created,
            updated: updated
        }
    }
};

exports.mm = new Mm();
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

    //  data[question][user].messages : Array   contains all messages that have been modified
    //  data[question][user].status : Object    contains any status messages to send to the user
};


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
    this.data.walls[wall_id].status.connected_teachers[nickname] = Date.now();
    this.data.total_talkwall_connections++;

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
 * Add additional users to a question
 *
 * @param {string} wall_id
 * @param {string} question_id (can be 'none')
 * @param {string} nickname
 * @param {boolean} isTeacher
 */
Mm.prototype.addUserToQuestion = function(wall_id, question_id, nickname, isTeacher) {

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

    this.data.walls[wall_id].questions[question_id].updated[nickname] = {};
    this.data.walls[wall_id].questions[question_id].created[nickname] = {};
};

/**
 * Check that a student nickname is listed on the given wall
 *
 * @param {string} wall_id
 * @param {string} nickname
 */
Mm.prototype.studentIsOnWall = function(wall_id, nickname) {
    return this.data.walls.hasOwnProperty(wall_id)
        && this.data.walls[wall_id].status.connected_students.hasOwnProperty(nickname);
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
    if (this.data.walls.hasOwnProperty(wall_id)) {
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
    // Remove this nickname from the wall's connected users
    if (typeof this.data.walls[wall_id] !== 'undefined') {
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
        delete this.data.walls[wall_id];
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
    if (question_id !== 'none') {
        this.data.walls[wall_id].status.teacher_current_question = question_id;
    }
    this.data.walls[wall_id].status.last_update = Date.now();
};

/**
 * Update a message
 *
 * @param {string} wall_id
 * @param {string} question_id                      question_id can be 'none' if the teacher has not changed questions
 * @param {string} nickname                         the particular calling user
 * @param {object} updated_message                  the message object edited by the calling user. null if no changes
 * @param {string} controlString                    the type of update to be performed
 * @param {boolean} isTeacher                       the teacher is making this request
 */
Mm.prototype.postUpdate = function(wall_id, question_id, nickname, updated_message, controlString, isTeacher) {

    // Note that someone is using this wall
    this.data.walls[wall_id].status.last_access = Date.now();

    function editUpdate(userQueue) {

        // Has an update to this message already been registered?
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

    var connectedStudents = this.data.walls[wall_id].status.connected_students;
    var connectedTeachers = this.data.walls[wall_id].status.connected_teachers;

    // Make note of my changes in other users' lists on the same question
    switch(controlString) {

        // Only the originator of a message can make a 'create' ( a new message )
        case 'create':
            for (var student in connectedStudents) {
                if (student !== nickname && connectedStudents.hasOwnProperty(student)) {
                    this.data.walls[wall_id].questions[question_id].created[student][updated_message._id] = updated_message;
                }
            }
            for (var teacher in connectedTeachers) {
                if (teacher !== nickname && connectedTeachers.hasOwnProperty(teacher)) {
                    this.data.walls[wall_id].questions[question_id].created[teacher][updated_message._id] = updated_message;
                }
            }
            break;

        // Only the originator of a message can make an 'edit' ( change text or mark as deleted )
        case 'edit':

            var userQueue = null;

            // Update student notifications
            for (var student2 in connectedStudents) {

                // If the nickname is not our own, make a notification
                if (student2 !== nickname && connectedStudents.hasOwnProperty(student2)) {
                    userQueue = this.data.walls[wall_id].questions[question_id].updated[student2];
                    editUpdate(userQueue);
                }
            }

            // Update teacher notification
            for (var teacher2 in connectedTeachers) {

                // If the nickname is not our own, make a notification
                if (teacher2 !== nickname && connectedTeachers.hasOwnProperty(teacher2)) {
                    userQueue = this.data.walls[wall_id].questions[question_id].updated[teacher2];
                    editUpdate(userQueue);

                    // Teacher's update may already have position data, so mark it now as mixed data
                    userQueue[updated_message._id].updateType
                        = userQueue[updated_message._id].updateType === 'position' ? 'mixed' : 'edit';
                }
            }
            break;

        // Anyone can report position changes, but only the teacher will see them (spec as at December 2016)
        case 'position':

            for (var teacher3 in connectedTeachers) {

                // If the nickname is not our own, make a notification
                if (teacher3 !== nickname && connectedTeachers.hasOwnProperty(teacher3)) {
                    userQueue = this.data.walls[wall_id].questions[question_id].updated[teacher3];

                    // Has an update to this message already been registered?
                    if (userQueue.hasOwnProperty(updated_message._id)) {

                        // Check if the updated message contains this nickname. This request may remove it from the board
                        if (updated_message.board.hasOwnProperty(nickname)) {
                            userQueue[updated_message._id].board[nickname] = updated_message.board[nickname];
                        } else {
                            delete userQueue[updated_message._id].board[nickname];
                        }

                        // Teacher's update may already have edit data, so mark it now as mixed data
                        userQueue[updated_message._id].updateType
                            = userQueue[updated_message._id].updateType === 'edit' ? 'mixed' : 'position';
                    } else {
                        userQueue[updated_message._id] = {
                            board: updated_message.board,
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
        return null;
    }

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
    if(this.data.walls[wall_id].status[clientType].hasOwnProperty(nickname)) {
        this.data.walls[wall_id].status[clientType][nickname] = Date.now();
    }

    // Return my pending updates and any change to status
    return {
        totalOnTalkwall: this.data.total_talkwall_connections,
        status: this.data.walls[wall_id].status,
        created: created,
        updated: updated
    }
};

exports.mm = new Mm();
/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";
    import MomentStatic = moment.MomentStatic;

    enum LogType {
        EditMessage = 0,
        MarkMessage = 1,
        EditTask = 2,
        AddTask = 3,
        PromoteMessage = 4,
        MoveMessage = 5
    }

    export class User {
        _id: string;
        nickname: string;
        lastOpenedWall: string;   //wall _id
        defaultEmail: string;
    }

    export class Wall {
        _id: string;
        pin: string;
        label: string;
        createdAt: Date;
        createdBy: string;
        closed: boolean;
        questions: Array<Question>;
        targetEmail: string;
    }

    export interface IQuestion {
        _id: string;
        createdAt: Date;
        label: string;
        grid: string;
        messages: Array<Message>;
        contributors: Array<string>;

        updateMe(newQuestion: {}): Question;
    }

    export class Question implements IQuestion {
        _id: string;
        createdAt: Date;
        label: string;
        grid: string;
        messages: Array<Message>;
        showControls: boolean;
        contributors: Array<string>;
        isNew: boolean;

        constructor(label: string) {
            this.label = label;
            this.grid = 'none';
            this.messages = [];
            this.showControls = false;
            this.createdAt = new Date();
            this.contributors = [];
            this.isNew = false;
        }

        updateMe(newQuestion: {}): Question {
            this._id = newQuestion['_id'];
            this.createdAt = newQuestion['createdAt'];
            this.label = newQuestion['label'];
            this.grid = newQuestion['grid'];
            if (typeof newQuestion['contributors'] !== 'undefined' && newQuestion['contributors'] !== null) {
                this.contributors = newQuestion['contributors'];
            }

            return this;
        }
    }


    /* Sub classes for Message */

    export class Nickname {
        xpos: number;
        ypos: number;
        highlighted: boolean;

        constructor(x, y, highlighted) {
            this.xpos = x;
            this.ypos = y;
            this.highlighted = highlighted;
        }

        updateMe(x, y, highlighted) {
            this.xpos = x;
            this.ypos = y;
            this.highlighted = highlighted;
        }
    }

    export interface IMessage {
        updateMe(newMessage: {}): Message;
    }

    export class Message implements IMessage {
        _id: string;
        question_id: string;
        createdAt: Date;
        text: string;
        creator: string;        //nickname
        deleted: boolean;
        isHighlighted: boolean;  // dynamic local attribute - not stored at server
        origin: {}[];
        edits: {}[];
        board: { [nickname: string] : Nickname };

        constructor() {
            this.createdAt = new Date();
            this.deleted = false;
            this.text = '';
            this.origin = [];
            this.edits = [];
            this.board = {};
            this.isHighlighted = false;
        }

        createFromOrigin(originMessage: Message, newNickname) {

            // no _id until sent to server

            this.text = originMessage.text;
            this.creator = newNickname;
            this.question_id = originMessage.question_id;

            originMessage.origin.forEach((origin) => {
                this.origin.push(origin);
            });
            this.origin.push({nickname: newNickname, message_id: originMessage._id});
            this.origin.reverse();

            if (typeof originMessage.board[newNickname] !== 'undefined') {
                this.board[newNickname] = new Nickname(
                    originMessage.board['xpos'],
                    originMessage.board['ypos'],
                    originMessage.board['highlighted']
                );
            }

            return this;
        }

        updateMe(newMessage: {}) {
            this._id = newMessage['_id'];
            this.createdAt = newMessage['createdAt'];
            this.deleted = newMessage['deleted'];
            this.creator = newMessage['creator'];
            this.text = newMessage['text'];
            this.question_id = newMessage['question_id'];

            if (typeof newMessage['board'] !== 'undefined' && newMessage['board'] !== null) {
                this.updateBoard(newMessage['board']);
            } else {
                // Remove all nicknames
                for (let nickname in this.board) {
                    if(this.board.hasOwnProperty(nickname)) {
                        delete this.board[nickname];
                    }
                }
            }

            if (typeof newMessage['origin'] !== 'undefined' && newMessage['origin'] !== null) {
                this.origin = newMessage['origin'];
            }

            if (typeof newMessage['edits'] !== 'undefined' && newMessage['edits'] !== null) {
                this.edits = newMessage['edits'];
            }

            return this;
        }

        updateBoard(newBoard) {
            for (let nickname in newBoard) {
                if(newBoard.hasOwnProperty(nickname)) {

                    // Update an existing nickname
                    if(this.board.hasOwnProperty(nickname)) {
                        this.board[nickname].updateMe(
                            newBoard[nickname]['xpos'],
                            newBoard[nickname]['ypos'],
                            newBoard[nickname]['highlighted']);
                    }
                    // Create a new nickname
                    else {
                        this.board[nickname] = new Nickname(
                            newBoard[nickname]['xpos'],
                            newBoard[nickname]['ypos'],
                            newBoard[nickname]['highlighted']);
                    }
                }
            }
            // Remove nicknames no longer in the updated message
            for (let nickname in this.board) {
                if(this.board.hasOwnProperty(nickname) && !newBoard.hasOwnProperty(nickname)) {
                    delete this.board[nickname];
                }
            }
        }
    }


    // Queues contain only the modifiable data needed

    export class UpdatedQueueItem {
        board: { [nickname: string] : {
                xpos: number;
                ypos: number;
                highlighted: boolean;
            }
        };
        text: string;
        deleted: boolean;
        updateType: string;         // 'edit' , 'position' or 'mixed'
    }

    export class CreatedQueueItem {
        createdAt: Date;
        creator: string;
        origin: Array<{
            nickname: String,
            message_id: String
        }>;
        board: { [nickname: string] : {
            xpos: number,
            ypos: number,
            highlighted: boolean
        } };
        text: string;
        deleted: boolean;
    }

    // Class used to send and respond with status & message updates through polling
    export class PollUpdate {
        totalOnTalkwall: number;
        status: {
            last_update: number;
            last_access: number;
            teacher_current_question: string;
            connected_teachers: Array<string>;
            connected_students: Array<string>;
            idleTerminationTime: number;
        };
        created: { [message_id: string] : CreatedQueueItem };
        updated: { [message_id: string] : UpdatedQueueItem };

        // set status to PollUpdate('', false) to prevent any status update on server
        constructor(question_id) {
            this.totalOnTalkwall = 0;
            this.status = {
                last_update: Date.now(),
                last_access: Date.now(),
                teacher_current_question: question_id,
                connected_teachers: [],
                connected_students: [],
                idleTerminationTime: 0
            };
            this.created = {};
            this.updated = {};
        }
    }

    export class LogEntry {
        type: LogType;
        id: string;
        nickname: string;
        timestamp: Date;
        diff: {x: number, y: number };

        constructor(type, id, nickname, diff) {
            this.type = type;
            this.id = id;
            this.nickname = nickname;
            this.diff = diff;
            this.timestamp = new Date();
        }
    }
}

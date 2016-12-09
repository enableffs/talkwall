/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";
    import MomentStatic = moment.MomentStatic;

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
            this.isNew = false;
        }

        updateMe(newQuestion: {}): Question {
            this._id = newQuestion['_id'];
            this.createdAt = newQuestion['createdAt'];
            this.label = newQuestion['label'];
            this.grid = newQuestion['grid'];
            this.contributors = newQuestion['contributors'];

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
        }

        updateMe(newMessage: {}) {
            this._id = newMessage['_id'];
            this.createdAt = newMessage['createdAt'];
            this.deleted = newMessage['deleted'];
            this.creator = newMessage['creator'];
            this.text = newMessage['text'];
            this.updateSubsections(newMessage);
            this.question_id = newMessage['question_id'];

            if (typeof newMessage['origin'] !== 'undefined' && newMessage['origin'] !== null) {
                this.origin = newMessage['origin'];
            }

            if (typeof newMessage['edits'] !== 'undefined' && newMessage['edits'] !== null) {
                this.edits = newMessage['edits'];
            }

            return this;
        }

        private updateSubsections(newMessage) {
            if (typeof newMessage['board'] !== 'undefined' && newMessage['board'] !== null) {
                for (let nickname in newMessage['board']) {
                    if(newMessage['board'].hasOwnProperty(nickname)) {

                        // Update an existing nickname
                        if(this.board.hasOwnProperty(nickname)) {
                            this.board[nickname].updateMe(
                                newMessage['board'][nickname]['xpos'],
                                newMessage['board'][nickname]['ypos'],
                                newMessage['board'][nickname]['highlighted']);
                        }
                        // Create a new nickname
                        else {
                            this.board[nickname] = new Nickname(
                                newMessage['board'][nickname]['xpos'],
                                newMessage['board'][nickname]['ypos'],
                                newMessage['board'][nickname]['highlighted']);
                        }
                    }
                }
                // Remove nicknames no longer in the updated message
                for (let nickname in this.board) {
                    if(this.board.hasOwnProperty(nickname) && !newMessage['board'].hasOwnProperty(nickname)) {
                        delete this.board[nickname];
                    }
                }
            // Remove all nicknames
            } else {
                for (let nickname in this.board) {
                    if(this.board.hasOwnProperty(nickname)) {
                        delete this.board[nickname];
                    }
                }
            }
        }
    }

    // Class used to send and respond with status & message updates through polling
    export class PollUpdate {
        status: {
            last_update: number;
            teacher_question_id: string;
            connected_nicknames: Array<string>;
        };
        messages: Array<Message>;

        // set status to PollUpdate('', false) to prevent any status update on server
        constructor(question_id) {
            this.status = {
                last_update: Date.now(),
                teacher_question_id: question_id,
                connected_nicknames: [],
            };
            this.messages = [];
        }
    }
}

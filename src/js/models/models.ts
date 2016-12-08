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
        participants: Array<string>;

        updateMe(newQuestion: {}): Question;
    }

    export class Question implements IQuestion {
        _id: string;
        createdAt: Date;
        label: string;
        grid: string;
        messages: Array<Message>;
        showControls: boolean;
        participants: Array<string>;
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
            this.participants = newQuestion['participants'];

            return this;
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
        isPinned: boolean;
        origin: {}[];
        edits: {}[];
        board: {};
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
            if (typeof newMessage['origin'] !== 'undefined' && newMessage['origin'] !== null) {
                this.origin = newMessage['origin'];
            }
            if (typeof newMessage['edits'] !== 'undefined' && newMessage['edits'] !== null) {
                this.edits = newMessage['edits'];
            }
            if (typeof newMessage['board'] !== 'undefined' && newMessage['board'] !== null) {
                this.board = newMessage['board'];
            }
            this.question_id = newMessage['question_id'];

            return this;
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

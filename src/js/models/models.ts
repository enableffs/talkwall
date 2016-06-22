/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";
    import MomentStatic = moment.MomentStatic;
    var moment: MomentStatic;

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
    }

    export class Question implements IQuestion {
        _id: string;
        createdAt: Date;
        label: string;
        grid: string;
        messages: Array<Message>;
        showControls: boolean;

        constructor(label: string) {
            this.label = label;
            this.grid = 'none';
            this.messages = [];
            this.showControls = false;
        }
    }


    export class Message {
        _id: string;
        question_id: string;
        createdAt: Date;
        text: string;
        creator: string;        //nickname
        deleted: boolean;
        isSelected: boolean;
        isPinned: boolean;
        origin: Array<{
            nickname: string;
            message_id: string;
        }>;
        edits: Array<{
            date: Date;
            text: string;
        }>;
        board: {};
        constructor() {
            this.createdAt = new Date();
            this.deleted = false;
            this.text = '';
            this.origin = [];
            this.edits = [];
            this.board = {};
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
        constructor(question_id, close_wall) {
            this.status = {
                last_update: Date.now(),
                teacher_question_id: question_id,
                connected_nicknames: [],
            };
            this.messages = [];
        }
    }
}

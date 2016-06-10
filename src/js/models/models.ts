/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";

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

    }

    export interface IQuestion {
        _id: string;
        createdAt: Date;
        label: string;
        messages: Array<Message>;
    }

    export class Question implements IQuestion {
        _id: string;
        createdAt: Date;
        label: string;
        messages: Array<Message>;

        constructor(label: string) {
            this.label = label;
            this.messages = [];
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
            commands_to_server: {
                select_question_id: string;     // set to '' for no change
                close_wall: boolean;             // set to false for no change
            },
            connected_nicknames: Array<string>;
        };
        messages: Array<Message>;

        // set status to PollUpdate('', false) to prevent any status update on server
        constructor(question_id, close_wall) {
            this.status = {
                commands_to_server : {
                    select_question_id: question_id,
                    close_wall: close_wall
                },
                connected_nicknames: [],
            };
            this.messages = [];
        }
    }
}

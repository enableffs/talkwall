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
        createdAt: Date;
        questions: Array<Question>;

        // Return the Question for the given question ID
        getQuestionById(id: string): Question {
            this.questions.forEach(function(q) {
                if (q._id === id) {
                    return q;
                }
            });
            return null;
        }
        // Return the index of the given question ID
        getQuestionIndexById(id: string): number {
            this.questions.forEach(function(q, index) {
                if (q._id === id) {
                    return index;
                }
            });
            return -1;
        }
    }

    export class Question {
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

    export class PollUpdate {
        status: {
            select_question_id: string;
            connected_nicknames: Array<string>;
        };
        messages: Array<Message>;
    }
}

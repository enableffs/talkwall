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
        }
    }

    export class PollUpdate {
        status: {
            select_question_id: string;
            connected_nicknames: Array<string>;
        };
        messages: {};
    }
}

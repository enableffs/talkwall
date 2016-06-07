/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";

    export class User {
        _id: string;
        lastOpenedWall: string;   //wall _id
        defaultEmail: string;
    }

    export class Wall {
        _id: string;
        pin: string;
        createdAt: Date;
        questions: Array<{
            _id: string;        //Question._id
            label: string;      //Question.label
        }>;
    }

    export class Question {
        _id: string;
        createdAt: Date;
        label: string;
        messageFeed: Array<Message>;
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
}

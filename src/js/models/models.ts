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
        createdOn: Date;
        questions: Array<string>;
        constructor() {
            this.createdOn = new Date();
        }
    }

    export class Question {
        _id: string;
        createdOn: Date;
        label: string;
    }
}

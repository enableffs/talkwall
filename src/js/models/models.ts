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
        questions: Array<{}>;
    }

    export class Question {
        _id: string;
        createdAt: Date;
        label: string;
    }
}

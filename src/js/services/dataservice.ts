/// <reference path="../_references.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    "use strict";

    export interface IDataService {
    }

    export class DataService implements IDataService {
        constructor() {
            console.log('--> DataService started ...');
        }
    }
}

/// <reference path="../_references.ts"/>

module SamtavlaApp {
    "use strict";

    export interface IURLService {
    }

    export class URLService implements IURLService {
        constructor() {
            console.log('--> URLService started ...');
        }
    }
}


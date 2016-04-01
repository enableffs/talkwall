/// <reference path="../_references.ts"/>


module SamtavlaApp {
    "use strict";

    export interface IUtilityService {
    }

    export class UtilityService implements IUtilityService {
        constructor() {
	        console.log('--> UtilityService started ...');
        }
    }
}

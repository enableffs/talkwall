/// <reference path="../_references.ts"/>


module TalkwallApp {
    "use strict";

    export interface IUtilityService {
    }

    export class UtilityService implements IUtilityService {
        constructor() {
	        console.log('--> UtilityService started ...');
        }
    }
}

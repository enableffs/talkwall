/// <reference path="../_references.ts"/>


module TalkwallApp {
    "use strict";

    export interface IUtilityService {
        /**
         * generate a UID
         * @return the UID
         */
        v4(): string;
        /**
         * generate a random number between two values
         * @return the random number
         */
        getRandomBetween(min: number, max: number): number;
    }

    export class UtilityService implements IUtilityService {
        constructor() {
	        console.log('--> UtilityService started ...');
        }

        v4(): string {
            var id = '', i;

            for (i = 0; i < 36; i++) {
                if (i === 14) {
                    id += '4';
                } else if (i === 19) {
                    id += '89ab'.charAt(this.getRandom(4));
                } else if (i === 8 || i === 13 || i === 18 || i === 23) {
                    id += '-';
                } else {
                    id += '0123456789abcdef'.charAt(this.getRandom(16));
                }
            }
            return id;
        }

        getRandom(max: number): number {
            return Math.random() * max;
        }


        getRandomBetween(min: number, max: number) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }
}

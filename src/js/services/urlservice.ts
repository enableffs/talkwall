/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";
    import ILocationService = angular.ILocationService;

    export interface IURLService {
        getDomain(): string;
        getURL(): string;
    }

    export class URLService implements IURLService {
        static $inject = ["$location"];
        private domain: string  = 'en';
        constructor( private $location: ILocationService ) {
            if (this.$location.host().indexOf('.no') > -1) {
                this.domain = 'no';
            }

            console.log('--> URLService started ... the locale used is: ' + this.domain);
        }

        getDomain(): string {
            return this.domain;
        }

        getURL(): string {
            return this.$location.protocol() + '://' + this.$location.host() + ':' + this.$location.port();
        }
    }
}

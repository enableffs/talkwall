/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";
    import ILocationService = angular.ILocationService;

    export interface IURLService {
        /**
         * get the host's web address
         * @return string representing the host (for ex: http://URL:PORT)
         */
        getHost(): string;
    }

    export class URLService implements IURLService {
        static $inject = ['$location'];

        constructor( private $location: ILocationService ) {
            console.log('--> URLService started ... ');
        }

        getHost(): string {
            return this.$location.protocol() + '://' + this.$location.host() + ':' + this.$location.port();
        }
    }
}

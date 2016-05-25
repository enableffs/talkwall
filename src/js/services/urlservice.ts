/// <reference path="../_references.ts"/>

module TalkwallApp {
    "use strict";
    import ILocationService = angular.ILocationService;

    export interface IURLService {
        /**
         * get the language domain
         * @return string representing the current domain ('no' for norwegian, 'en' for english, etc)
         */
        getLanguageDomain(): string;
        /**
         * get the host's web address
         * @return string representing the host (for ex: http://URL:PORT)
         */
        getHost(): string;
    }

    export class URLService implements IURLService {
        static $inject = ["$location"];
        private languageDomain: string  = 'en';
        constructor( private $location: ILocationService ) {
            if (this.$location.host().indexOf('.no') > -1) {
                this.languageDomain = 'no';
            }

            console.log('--> URLService started ... the locale used is: ' + this.languageDomain);
        }

        getLanguageDomain(): string {
            return this.languageDomain;
        }

        getHost(): string {
            return this.$location.protocol() + '://' + this.$location.host() + ':' + this.$location.port();
        }
    }
}

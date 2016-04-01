/// <reference path="../_references.ts"/>
/// <reference path="authenticationservice.ts"/>

module SamtavlaApp {
    "use strict";

    export interface ITokenInterceptor {
        request(config: ng.IRequestConfig): ng.IRequestConfig;
        requestError(rejection: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallbackArg<any>;
        response(response: ng.IPromise<any>): ng.IPromise<any>;
        responseError(rejection: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallbackArg<any>;
    }

    export class TokenInterceptor implements ITokenInterceptor {
        static $inject = ['$q', '$window', '$location', 'AuthenticationService'];

        constructor(
            private $q: ng.IQService,
            private $window: ng.IWindowService,
            private $location: ng.ILocationService,
            private authenticationService: IAuthenticationService) {

            console.log('--> ITokenInterceptor started ...');
        }

        public request = (config) => {
            let tKey = 'token', aKey = 'Authorization';
            config.headers = config.headers || {};
            if (this.$window.sessionStorage[tKey]) {
                config.headers[aKey] = 'Bearer ' + this.$window.sessionStorage[tKey];
            }
            return config;
        };

        public requestError = (rejection) => {
            return this.$q.reject(rejection);
        };

        public response = (response) => {
            let tKey = 'token', sKey = 'status';
            if (response !== null && response[sKey] === 200 && this.$window.sessionStorage[tKey]
                && !this.authenticationService.isAuthenticated) {
                this.authenticationService.isAuthenticated = true;
                console.log('TokenInterceptor: client already authenticated: ' + this.$window.sessionStorage[tKey]);
                //this.$location.path("/");
            }

            return response || this.$q.when(response);
        };

        public responseError = (rejection) => {
            let tKey = 'token';
            if (rejection !== null && rejection.status === 401 && (this.$window.sessionStorage[tKey]
                || this.authenticationService.isAuthenticated)) {
                delete this.$window.sessionStorage[tKey];

                this.authenticationService.isAuthenticated = false;
                console.log('TokenInterceptor: client NOT authenticated');
                this.$location.path("/login");
            }

            return this.$q.reject(rejection);
        };
    }
}

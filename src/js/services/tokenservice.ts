/*
 Copyright 2016, 2017 Richard Nesnass and Jeremy Toussaint

 This file is part of Talkwall.

 Talkwall is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Talkwall is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Talkwall.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
import {AuthenticationService} from "./authenticationservice";

export interface ITokenInterceptor {
    request(config: ng.IRequestConfig): ng.IRequestConfig;
    requestError(rejection: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallbackArg<any>;
    response(response: ng.IPromise<any>): ng.IPromise<any>;
    responseError(rejection: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallbackArg<any>;
}

export class TokenInterceptor {
    static $inject = ['$q', '$window', '$location', 'AuthenticationService'];

    constructor(
        private $q: ng.IQService,
        private $window: ng.IWindowService,
        private $location: ng.ILocationService,
        private authenticationService: AuthenticationService) {

        console.log('--> ITokenInterceptor started ...');
    }

    public request = (config: any) => {
        let tKey = 'token', aKey = 'Authorization';
        config.headers = config.headers || {};
        if (this.$window.sessionStorage[tKey]) {
            config.headers[aKey] = 'Bearer ' + this.$window.sessionStorage[tKey];
        }
        return config;
    };

    public requestError = (rejection: any) => {
        return this.$q.reject(rejection);
    };

    public response = (response: any) => {
        let tKey = 'token', sKey = 'status';
        if (response !== null && response[sKey] === 200 && this.$window.sessionStorage[tKey]
            && !this.authenticationService.isAuthenticated) {
            this.authenticationService.isAuthenticated = true;
            console.log('TokenInterceptor: client already authenticated: ' + this.$window.sessionStorage[tKey]);
            //this.$location.path("/");
        }

        return response || this.$q.when(response);
    };

    public responseError = (rejection: any) => {
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
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

import ILocationService = angular.ILocationService;

export class URLService {
    static $inject = ['$location'];

    constructor( private $location: ILocationService ) {
        console.log('--> URLService started ... ');
    }

    getHost(): string {
        if (this.$location.port() === 80) {
            return this.$location.protocol() + '://' + this.$location.host();
        } else {
            return this.$location.protocol() + '://' + this.$location.host() + ':' + this.$location.port();
        }
    }
}
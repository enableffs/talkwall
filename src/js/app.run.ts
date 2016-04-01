/// <reference path="_references.ts"/>

module SamtavlaApp {

    'use strict';

    runApp.$inject = ['$rootScope'];

    export function runApp($rootScope: ng.IRootScopeService) {
        console.log('--> runApp started');
    }
}

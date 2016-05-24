/// <reference path="_references.ts"/>

module TalkwallApp {

    'use strict';

    configApp.$inject = ['$translateProvider', '$httpProvider', '$routeProvider'];

    export function configApp($translateProvider: angular.translate.ITranslateProvider, $httpProvider: ng.IHttpProvider,
                              $routeProvider: ng.route.IRouteProvider) {

        // Routes
        $routeProvider.
            when('/wall', {
                templateUrl : 'js/components/wall/wall.html'
            })
            .when('/', {
                templateUrl : 'js/components/landing/landing.html'
            });

        // Token interceptor
        $httpProvider.interceptors.push('TokenInterceptor');

        // Translation
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.useStaticFilesLoader({
            prefix: './languages/',
            suffix: '.json'
        });
    }
}

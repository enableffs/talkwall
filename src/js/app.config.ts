/// <reference path="_references.ts"/>

module TalkwallApp {

    'use strict';
    configApp.$inject = ['$translateProvider', '$httpProvider', '$routeProvider'];

    /**
     * Application-wide overall configuration
     * @param $translateProvider  Used for defining default language translation support.
     * @param $httpProvider  Used for registering an interceptor (TokenInterceptor).
     * @param $routeProvider  Used for defining default routing.
     */
    export function configApp($translateProvider: angular.translate.ITranslateProvider, $httpProvider: ng.IHttpProvider,
                              $routeProvider: ng.route.IRouteProvider) {

        // Routes
        $routeProvider.
            when('/export', {
                templateUrl : 'js/components/export/export.html'
            })
            .when('/id', {
                templateUrl : 'js/components/sessioninfo/sessioninfo.html'
            })
            .when('/wall', {
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

        var lang = null;
        let languagesKey: string = 'languages';
        let langKey: string = 'lang';
        if (navigator[languagesKey]) {
            lang = navigator[languagesKey][0];
        } else {
            lang = navigator.language || navigator['userLanguage'];
        }

        if (lang.indexOf('no') > -1 || lang.indexOf('nb') > -1) {
            $translateProvider.preferredLanguage('no');
            sessionStorage[langKey] = 'no';
        } else {
            $translateProvider.preferredLanguage('en');
            sessionStorage[langKey] = 'en';
        }
    }
}

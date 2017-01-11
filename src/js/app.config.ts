/// <reference path="_references.ts"/>

module TalkwallApp {

    'use strict';
    configApp.$inject = ['$translateProvider', '$httpProvider', '$routeProvider', '$mdThemingProvider'];

    /**
     * Application-wide overall configuration
     * @param $translateProvider  Used for defining default language translation support.
     * @param $httpProvider  Used for registering an interceptor (TokenInterceptor).
     * @param $routeProvider  Used for defining default routing.
     * @param $mdThemingProvider Used to set Angular Material theme settings
     */
    export function configApp($translateProvider: angular.translate.ITranslateProvider, $httpProvider: ng.IHttpProvider,
                              $routeProvider: ng.route.IRouteProvider, $mdThemingProvider: ng.material.IThemingProvider) {

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


        //$mdThemingProvider['disableTheming']();
        let customPrimary = {
            '50': '#ffffff',
            '100': '#ffffff',
            '200': '#ffffff',
            '300': '#ffffff',
            '400': '#ffffff',
            '500': '#FFF',
            '600': '#f2f2f2',
            '700': '#e6e6e6',
            '800': '#d9d9d9',
            '900': '#cccccc',
            'A100': '#ffffff',
            'A200': '#ffffff',
            'A400': '#ffffff',
            'A700': '#bfbfbf',
            'hue-3': '#ffffff',
        };
        $mdThemingProvider
            .definePalette('customPrimary',
                customPrimary);

        let customBackground = {
            '50': '#ffffff',
            '100': '#ffffff',
            '200': '#ffffff',
            '300': '#ffffff',
            '400': '#ffffff',
            '500': '#FFF',
            '600': '#f2f2f2',
            '700': '#e6e6e6',
            '800': '#d9d9d9',
            '900': '#cccccc',
            'A100': '#ffffff',
            'A200': '#ffffff',
            'A400': '#ffffff',
            'A700': '#bfbfbf',
            'hue-3': '#ffffff',
        };
        $mdThemingProvider
            .definePalette('customBackground',
                customBackground);

        $mdThemingProvider.theme('default')
            .primaryPalette('customPrimary')
            .backgroundPalette('customBackground');


        let lang = null;
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

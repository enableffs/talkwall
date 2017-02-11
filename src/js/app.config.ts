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

/**
 * Application-wide overall configuration
 * @param $translateProvider  Used for defining default language translation support.
 * @param $httpProvider  Used for registering an interceptor (TokenInterceptor).
 * @param $routeProvider  Used for defining default routing.
 * @param $mdThemingProvider Used to set Angular Material theme settings
 * @param momentPickerProvider settings for date and time picker
 */
export function configApp($translateProvider: angular.translate.ITranslateProvider, $httpProvider: ng.IHttpProvider,
                          $routeProvider: ng.route.IRouteProvider, $mdThemingProvider: ng.material.IThemingProvider, momentPickerProvider: any) {

    // Routes
    $routeProvider.
        when('/export', {
            templateUrl : 'js/components/export/export.html'
        })
        .when('/id', {
            templateUrl : 'js/components/sessioninfo/sessioninfo.html'
        })
        .when('/logs', {
            templateUrl : 'js/components/logs/logs.html'
        })
        .when('/nvivo', {
            templateUrl : 'js/components/nvivologs/nvivologs.html'
        })
        .when('/organiser', {
            templateUrl : 'js/components/organiser/organiser.html'
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

    /*
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
    */

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
    /*$mdThemingProvider
        .definePalette('customBackground',
            customBackground);

    $mdThemingProvider.theme('default')
        //.primaryPalette('customPrimary')
        .backgroundPalette('customBackground');
*/

    momentPickerProvider.options({
        /* Picker properties */
        locale:        'en',
        format:        'L LTS',
        minView:       'decade',
        maxView:       'minute',
        startView:     'year',
        autoclose:     true,
        today:         false,
        keyboard:      false,

        /* Extra: Views properties */
        leftArrow:     '&larr;',
        rightArrow:    '&rarr;',
        yearsFormat:   'YYYY',
        monthsFormat:  'MMM',
        daysFormat:    'D',
        hoursFormat:   'HH',
        minutesFormat: 'mm', //moment.localeData().longDateFormat('LT').replace(/[aA]/, ''),
        secondsFormat: 'ss',
        minutesStep:   1,
        secondsStep:   1,
        showHeader:     false
    });



    let lang: string = null;
    if (typeof navigator['languages'] !== 'undefined' && navigator['languages'] !== null && navigator['languages'].length > 0) {
        lang = navigator['languages'][0];
    } else {
        lang = navigator.language || navigator['userLanguage'];
    }

    if (lang.indexOf('no') > -1 || lang.indexOf('nb') > -1) {
        $translateProvider.preferredLanguage('no');
        sessionStorage['lang'] = 'no';
    } else {
        $translateProvider.preferredLanguage('en');
        sessionStorage['lang'] = 'en';
    }
}
configApp.$inject = ['$translateProvider', '$httpProvider', '$routeProvider', '$mdThemingProvider', 'momentPickerProvider'];
/// <reference path="_references.ts"/>
/// <reference path="app.config.ts"/>

/// <reference path="services/dataservice.ts"/>
/// <reference path="services/authenticationservice.ts"/>
/// <reference path="services/tokenservice.ts"/>
/// <reference path="services/urlservice.ts"/>
/// <reference path="services/utilityservice.ts"/>

/// <reference path="app.run.ts"/>

module SamtavlaApp {
    'use strict';

    var dependencies = [
        'ngRoute',
        'ngAria',
        'ngAnimate',
        'pascalprecht.translate'
    ];

    angular.module('SamtavlaApp', dependencies)

        .config(configApp)

        .service('URLService', URLService)
        .service('DataService', DataService)
        .service('AuthenticationService', AuthenticationService)
        .service('TokenInterceptor', TokenInterceptor)
        .service('UtilityService', UtilityService)

        .run(runApp);
}
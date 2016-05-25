/// <reference path="_references.ts"/>
/// <reference path="app.config.ts"/>

/// <reference path="services/dataservice.ts"/>
/// <reference path="services/authenticationservice.ts"/>
/// <reference path="services/tokenservice.ts"/>
/// <reference path="services/urlservice.ts"/>
/// <reference path="services/utilityservice.ts"/>

/// <reference path="directives/autoresize.ts"/>

/// <reference path="components/login/login.ts"/>
/// <reference path="components/landing/landing.ts"/>
/// <reference path="components/wall/wall.ts"/>

/// <reference path="app.run.ts"/>

module TalkwallApp {
    'use strict';

    var dependencies = [
        'ngRoute',
        'ngAria',
        'ngAnimate',
        'pascalprecht.translate',
        'ngMaterial'
    ];

    angular.module('TalkwallApp', dependencies)

        .config(configApp)

        .service('URLService', URLService)
        .service('DataService', DataService)
        .service('AuthenticationService', AuthenticationService)
        .service('TokenInterceptor', TokenInterceptor)
        .service('UtilityService', UtilityService)
        .directive('autoresize', AutoResize)
        .controller('LoginController', LoginController)
        .controller('LandingController', LandingController)
        .controller('WallController', WallController)
        .run(runApp);
}

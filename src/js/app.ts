/// <reference path="_references.ts"/>
/// <reference path="app.config.ts"/>

/// <reference path="app.constants.ts"/>

/// <reference path="services/dataservice.ts"/>
/// <reference path="services/authenticationservice.ts"/>
/// <reference path="services/tokenservice.ts"/>
/// <reference path="services/urlservice.ts"/>
/// <reference path="services/utilityservice.ts"/>

/// <reference path="directives/autoresize.ts"/>
/// <reference path="components/feedMessage/feedMessage.ts"/>
/// <reference path="components/task/task.ts"/>
/// <reference path="directives/watchboardsize.ts"/>

/// <reference path="components/login/login.ts"/>
/// <reference path="components/join/join.ts"/>
/// <reference path="components/landing/landing.ts"/>
/// <reference path="components/wall/wall.ts"/>
/// <reference path="components/editMessagePanel/editMessagePanel.ts"/>

/// <reference path="app.run.ts"/>


/**
 * TalkwallApp core application module.
 * @preferred
 */
module TalkwallApp {
    'use strict';

    /**
     * Array of dependencies to be injected in the application "dependencies".
     */
    var dependencies = [
        'ngRoute',
        'ngAria',
        'ngAnimate',
        'pascalprecht.translate',
        'ngMaterial'
    ];

    angular.module('TalkwallApp', dependencies)

        .constant('TalkwallConstants', TalkwallConstants)
        .config(configApp)

        .service('URLService', URLService)
        .service('DataService', DataService)
        .service('AuthenticationService', AuthenticationService)
        .service('TokenInterceptor', TokenInterceptor)
        .service('UtilityService', UtilityService)
        .directive('autoresize', AutoResize)
        .directive('watchBoardSize', WatchBoardSize)
        .directive('feedMessage', FeedMessage)
        .directive('task', Task)
        .controller('LoginController', LoginController)
        .controller('JoinController', JoinController)
        .controller('CloseController', CloseController)
        .controller('LandingController', LandingController)
        .controller('WallController', WallController)
        .controller('EditMessageController', EditMessageController)
        .run(runApp);
}

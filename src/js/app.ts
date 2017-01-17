/// <reference path="_references.ts"/>
/// <reference path="app.config.ts"/>

/// <reference path="app.constants.ts"/>

/// <reference path="services/dataservice.ts"/>
/// <reference path="services/authenticationservice.ts"/>
/// <reference path="services/tokenservice.ts"/>
/// <reference path="services/urlservice.ts"/>
/// <reference path="services/utilityservice.ts"/>

/// <reference path="directives/autoresize.ts"/>
/// <reference path="directives/twMaxlength.ts"/>
/// <reference path="components/feedMessage/feedMessage.ts"/>
/// <reference path="components/organiserItem/organiserItem.ts"/>
/// <reference path="components/taskQuestion/taskQuestion.ts"/>
/// <reference path="directives/watchboardsize.ts"/>

/// <reference path="components/login/login.ts"/>
/// <reference path="components/join/join.ts"/>
/// <reference path="components/landing/landing.ts"/>
/// <reference path="components/archive/archive.ts"/>
/// <reference path="components/export/export.ts"/>
/// <reference path="components/wall/wall.ts"/>
/// <reference path="components/organiser/organiser.ts"/>
/// <reference path="components/sessioninfo/sessioninfo.ts"/>
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
    let dependencies = [
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
        .directive('twMaxlength', TwMaxlength)
        .directive('watchBoardSize', WatchBoardSize)
        .directive('feedMessage', FeedMessage)
        .directive('organiserItem', OrganiserItem)
        .directive('taskQuestion', TaskQuestion)
        .controller('ArchiveWallController', ArchiveWallController)
        .controller('LoginController', LoginController)
        .controller('JoinController', JoinController)
        .controller('CloseController', CloseController)
        .controller('LandingController', LandingController)
        .controller('SessionInfoController', SessionInfoController)
        .controller('ExportController', ExportController)
        .controller('WallController', WallController)
        .controller('OrganiserController', OrganiserController)
        .controller('EditMessageController', EditMessageController)
        .run(runApp);
}

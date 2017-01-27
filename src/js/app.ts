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

'use strict';

import {TalkwallConstants} from "./app.constants";
import {configApp} from "./app.config";
import {URLService} from "./services/urlservice";
import {DataService} from "./services/dataservice";
import {AuthenticationService} from "./services/authenticationservice";
import {TokenInterceptor} from "./services/tokenservice";
import {UtilityService} from "./services/utilityservice";
import {AutoResize} from "./directives/autoresize";
import {TwMaxlength} from "./directives/twMaxlength";
import {WatchBoardSize} from "./directives/watchboardsize";
import {FeedMessage} from "./components/feedMessage/feedMessage";
import {OrganiserItem} from "./components/organiserItem/organiserItem";
import {TaskQuestion} from "./components/taskQuestion/taskQuestion";
import {ArchiveWallController} from "./components/archive/archive";
import {LoginController} from "./components/login/login";
import {JoinController} from "./components/join/join";
import {CloseController} from "./components/close/close";
import {LandingController} from "./components/landing/landing";
import {SessionInfoController} from "./components/sessioninfo/sessioninfo";
import {ExportController} from "./components/export/export";
import {WallController} from "./components/wall/wall";
import {OrganiserController} from "./components/organiser/organiser";
import {EditMessageController} from "./components/editMessagePanel/editMessagePanel";
import {LogController} from "./components/logs/logs";
import {runApp} from "./app.run";
import {NvivoLogController} from "./components/nvivologs/nvivologs";

let dependencies = [
    'ngRoute',
    'ngAria',
    'ngMessages',
    'ngAnimate',
    'pascalprecht.translate',
    'ngMaterial',
    'moment-picker'
];

/**
 * TalkwallApp core application module.
 */
export let app = angular.module('TalkwallApp', dependencies)

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
    .controller('LogController', LogController)
    .controller('NvivoLogController', NvivoLogController)
    .run(runApp);

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

import IBottomSheetService = angular.material.IBottomSheetService;
import ISidenavService = angular.material.ISidenavService;
import IWindowService = angular.IWindowService;
import IScope = angular.IScope;
import * as models from "../../models/models";
import {DataService} from "../../services/dataservice";
import {UtilityService} from "../../services/utilityservice";
import {URLService} from "../../services/urlservice";
import * as moment from 'moment';
import Moment = moment.Moment;

export class NvivoLogController {
    static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', '$scope', '$timeout', 'URLService', '$window', 'UtilityService'];

    private data : {
        wall_id: string;
        startDateTime: Moment;
        timelineDateTime: Moment;
        videoLength: Moment;
        selectedTypes: {
            'mc': boolean;
            'me': boolean;
            'mp': boolean;
            'mup': boolean;
            'md': boolean;
            'mh': boolean;
            'muh': boolean;
            'mm': boolean;
            'tc': boolean;
            'te': boolean;
            'td': boolean;
            'sw': boolean;
        }
    };
    private wall: models.Wall = null;
    private errorString: string;
    private languageCode: string = 'no';

    constructor(
        private dataService: DataService,
        private $mdSidenav: ISidenavService,
        private $mdBottomSheet: IBottomSheetService,
        private $translate: angular.translate.ITranslateService,
        private $scope: IScope,
        private $timeout: angular.ITimeoutService,
        private urlService: URLService,
        private $window: IWindowService,
        private utilityService: UtilityService) {
        console.log('--> LogController: started: ');

        this.data = {
            wall_id: '',
            startDateTime: moment().utc(),
            timelineDateTime: moment(0).utc(),
            videoLength: moment(0).utc(),
            selectedTypes: {
                'mc': true,
                'me': true,
                'mp': false,
                'mup': false,
                'md': false,
                'mh': false,
                'muh': false,
                'mm': false,
                'tc': false,
                'te': false,
                'td': false,
                'sw': false
            }
        };
        let langKey: string = 'lang';
        this.languageCode = this.$window.sessionStorage[langKey];
    }

    requestWall(): void {
        this.dataService.requestWall(this.data.wall_id, () => {
            this.errorString = '';
            this.wall = this.dataService.data.wall;
        }, (error: {status: number, message: string}) => {
            this.errorString = error.message;
            console.log('Error getting wall');
        })
    }

    /**
     * The search will look for log entries that are dated between the 'clapper' time (filmed by the video) and the end of the video
     * End of video is deemed by adding the video duration to the 'clapper' time.
     * Each log entry is then given a relative time to fit it to nVivo timeline from t = 0 that is:  logDateTime - startDateTime + timelineDateTime
     */
    requestLogs(): void {
        let endDateTime = moment(this.data.startDateTime)
        .add({
            hours: this.data.videoLength.hours(),
            minutes: this.data.videoLength.minutes(),
            seconds: this.data.videoLength.seconds()
        });
        let selectedTypesArray = Object.keys(this.data.selectedTypes).filter((k) => {
            return this.data.selectedTypes[k];
        });
        this.dataService.requestLogs(this.data.wall_id, this.data.startDateTime.valueOf(), endDateTime.valueOf(), this.data.timelineDateTime.valueOf(), angular.toJson(selectedTypesArray), (logs: {}[]) => {
            console.log('Logs requested');

        }, (error: {status: number, message: string}) => {

        })
    }

}
"use strict";
import IBottomSheetService = angular.material.IBottomSheetService;
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

import ISidenavService = angular.material.ISidenavService;
import IWindowService = angular.IWindowService;
import IScope = angular.IScope;
import {Wall, User} from '../../models/models';
import {DataService} from "../../services/dataservice";
import {URLService} from "../../services/urlservice";
import {TalkwallConstants} from "../../app.constants";

let constants = TalkwallConstants.Constants;

export interface IOrganiserControllerService {
    /**
     * init function for this controller
     */
    activate(): void;
    openWall(wall: Wall): void;
    updateNickname(): void;
}

export class OrganiserController implements IOrganiserControllerService {
    static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', '$scope', '$timeout', 'URLService', '$window', 'UtilityService'];

    private user: User;
    private newNickname: string;
    private walls: Wall[];
    private recentWalls: Wall[];
    private newWall: {};
    private languageCode: string = 'no';
    private maxNicknameChars: number;

    constructor(
        private dataService: DataService,
        private $mdSidenav: ISidenavService,
        private $mdBottomSheet: IBottomSheetService,
        private $translate: angular.translate.ITranslateService,
        private $scope: IScope,
        private $timeout: angular.ITimeoutService,
        private urlService: URLService,
        private $window: IWindowService) {
        console.log('--> OrganiserController: started: ');

        let langKey: string = 'lang';
        this.languageCode = this.$window.sessionStorage[langKey];
        this.maxNicknameChars = constants['MAX_NICKNAME_CHARS'];

        this.dataService.checkAuthentication(() => {
            this.activate();
        }, null);

        this.recentWalls = [];
        this.newWall = {
            label: "",
            theme: ""
        };

    }

    /**
     * ensure the nickname includes only desired characters
     */
    filterNickname(): void {
        this.newNickname = this.newNickname.replace(/([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?/g, '');
    }

    itemFilter = (item: Wall) => {
        return !item.deleted;
    };

    activate(): void {
        this.user = this.dataService.data.user;
        this.newNickname = this.user.nickname;
        this.dataService.requestWalls((walls: Wall[]) => {
            this.walls = walls;

            // Determine recent walls
            this.walls.forEach((wall: Wall) => {
                if (this.user.recentWalls.indexOf(wall._id) > -1) {
                    this.recentWalls.push(wall);
                }
            })

        }, () => {
            console.log("No walls found");
        })
    }

    createWall(): void {
        this.dataService.createWall(this.newWall, (wall: Wall) => {
            this.walls.push(wall);
            this.openWall(wall);
        }, (error: {status: number, message: string}) => {
            console.log('Error creating wall: ' + error.message);
        })
    }

    openWall(wall: Wall): void {
        let openTheWall = (wall: Wall) => {
            this.dataService.data.wall = wall;
            this.dataService.requestWall(wall._id, () => {
                this.$window.location.href = this.urlService.getHost() + '/#/wall';
            }, () => {
                console.log('Error requesting wall');
            });
        };

        if (wall.closed) {
            wall.closed = false;
            this.dataService.updateWall(wall, (updatedWall: Wall) => {
                wall.pin = updatedWall.pin;
                openTheWall(wall);
            }, (error) => {
                console.log('error updating wall' + error);
            });
        } else {
            openTheWall(wall);
        }

    }

    updateNickname(): void {
        this.user.nickname = this.newNickname;
        this.dataService.updateUser(this.user, (result: {}) => {
            this.user.nickname = result['nickname'];
        }, () => {
            console.log('error updating user nickname');
        })
    }

}
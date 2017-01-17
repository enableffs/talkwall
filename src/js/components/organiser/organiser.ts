/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../../services/utilityservice.ts"/>
/// <reference path="../editMessagePanel/editMessagePanel.ts"/>

module TalkwallApp {
    "use strict";
    import IBottomSheetService = angular.material.IBottomSheetService;
    import ISidenavService = angular.material.ISidenavService;
    import IWindowService = angular.IWindowService;
    import IScope = angular.IScope;

    export interface IOrganiserControllerService {
        /**
         * init function for this controller
         */
        activate(): void;
        openWall(wall: Wall): void;
        updateNickname();
    }

    export class OrganiserController implements IOrganiserControllerService {
        static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', '$scope', '$timeout', 'URLService', '$window', 'UtilityService'];

        private user: User;
        private newNickname: string;
        private walls: Wall[];
        private recentWalls: Wall[];
        private newWall: {};
        private languageCode: string = 'no';

        constructor(
            private dataService: DataService,
            private $mdSidenav: ISidenavService,
            private $mdBottomSheet: IBottomSheetService,
            private $translate: angular.translate.ITranslateService,
            private $scope: IScope,
            private $timeout: angular.ITimeoutService,
            private urlService: IURLService,
            private $window: IWindowService,
            private utilityService: UtilityService) {
            console.log('--> OrganiserController: started: ');

            let langKey: string = 'lang';
            this.languageCode = this.$window.sessionStorage[langKey];

            this.dataService.checkAuthentication(() => {
                this.activate();
            }, null);

            this.recentWalls = [];
            this.newWall = {
                label: "",
                theme: ""
            };

        }

        activate(): void {
            this.user = this.dataService.data.user;
            this.newNickname = this.user.nickname;
            this.dataService.requestWalls((walls) => {
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
            this.dataService.createWall(this.newWall, (wall) => {
                this.walls.push(wall);
            }, (error) => {
                console.log('Error creating wall: ' + error.message);
            })
        }

        openWall(wall: Wall): void {
            if (!wall.closed) {
                this.dataService.data.wall = wall;
                this.dataService.requestWall(wall._id, () => {
                    this.$window.location.href = this.urlService.getHost() + '/#/wall';
                }, () => {
                    console.log('Error requesting wall');
                });
            }
        }

        updateNickname(): void {
            this.dataService.updateUser(this.user, (result) => {
                this.user.nickname = result.nickname;
            }, () => {
                console.log('error updating user nickname');
            })
        }

    }
}

import IBottomSheetService = angular.material.IBottomSheetService;
import ISidenavService = angular.material.ISidenavService;
import IWindowService = angular.IWindowService;
import IScope = angular.IScope;
import * as models from "../../models/models";
import {DataService} from "../../services/dataservice";
import {UtilityService} from "../../services/utilityservice";
import {URLService} from "../../services/urlservice";

export class NvivoLogController {
    static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', '$scope', '$timeout', 'URLService', '$window', 'UtilityService'];

    private data : {
        wall_id: string;
        datetime: Date;
        nvivoTime: Date;
        nvivoVideoLength: Date
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
            datetime: new Date(),
            nvivoTime: new Date(),
            nvivoVideoLength: new Date()
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

    requestLogs(): void {
        this.dataService.requestLogs(this.data, (logs: any) => {
            console.log('Logs requested');
        }, (error: {status: number, message: string}) => {

        })
    }

}
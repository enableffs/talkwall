import IDialogService = angular.material.IDialogService;
import IMedia = angular.material.IMedia;
import IWindowService = angular.IWindowService;
import {URLService} from "../../services/urlservice";
import {DataService} from "../../services/dataservice";
import {LoginController} from "../login/login";
import {JoinController} from "../join/join";
import IDialogOptions = angular.material.IDialogOptions;

export class LandingController {
	static $inject = ['URLService', '$translate', '$mdMedia', '$mdDialog', '$window', 'DataService'];

	//vars
	private customFullscreen: boolean;
	private languageCode: string = 'no';

	constructor(
		private urlService: URLService,
		private $translate: any,
		private $mdMedia: IMedia,
		private $mdDialog: IDialogService,
		private $window: IWindowService,
		private dataService: DataService) {
		console.log('--> LandingController: started');
		let langKey: string = 'lang';
		this.languageCode = this.$window.sessionStorage[langKey];
		this.$translate.use(this.languageCode);
		this.customFullscreen = this.$mdMedia('xs') || this.$mdMedia('sm');
	}

	/**
	 * display an advanced dialog for the login, and catches it's events
	 */
	showLoginDialog(ev: MouseEvent) : void {
		let handle = this;
		let dialogOptions: IDialogOptions = {
			controller: LoginController,
			controllerAs: 'loginC',
			templateUrl: 'js/components/login/login.html',
			targetEvent: ev,
			clickOutsideToClose: true
		};
		//detects if the device is small
		// let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
		//show the dialog
		this.$mdDialog.show(dialogOptions)
		.then((answer) => {
			this.$window.blur();
			//dialog answered
			console.log('--> LandingController: answer: ' + answer);
			handle.$window.location.href = handle.urlService.getHost() + answer;
		}, () => {
			this.$window.blur();
			//dialog dismissed
			console.log('--> LandingController: dismissed');
		});
	};

	/**
	 * display dialog for joining with pin and nickname
	 */
	showJoinDialog(ev: MouseEvent) : void {
		let handle = this;
		let dialogOptions: IDialogOptions = {
			controller: LoginController,
			controllerAs: 'joinC',
			templateUrl: 'js/components/join/join.html',
			targetEvent: ev,
			clickOutsideToClose: true
		};
		//detects if the device is small
		// let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
		//show the dialog
		this.$mdDialog.show({
				controller: JoinController,
				controllerAs: 'joinC',
				templateUrl: 'js/components/join/join.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true
			})
			.then((answer) => {
				this.$window.blur();
				handle.dataService.getClientWall(answer, () => {
					handle.dataService.data.status.joinedWithPin = true;
					handle.$window.location.href = handle.urlService.getHost() + '/#/wall';
				}, null);
			}, () => {
				this.$window.blur();
				//dialog dismissed
				console.log('--> LandingController: dismissed');
			});
	}
}
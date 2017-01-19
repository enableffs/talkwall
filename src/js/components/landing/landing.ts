/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../login/login.ts"/>
/// <reference path="../join/join.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	import IMedia = angular.material.IMedia;
	import IWindowService = angular.IWindowService;

	export class LandingController {
		static $inject = ['URLService', '$translate', '$mdMedia', '$mdDialog', '$window', 'DataService'];

		//vars
		private customFullscreen;
		private languageCode: string = 'no';

		constructor(
			private urlService: IURLService,
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
		showLoginDialog(ev) : void {
			let handle = this;
			//detects if the device is small
			let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
			//show the dialog
			this.$mdDialog.show({
				controller: LoginController,
				controllerAs: 'loginC',
				templateUrl: 'js/components/login/login.html',
				targetEvent: ev,
				clickOutsideToClose: true
			})
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
		showJoinDialog(ev) : void {
			let handle = this;
			//detects if the device is small
			let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
			//show the dialog
			this.$mdDialog.show({
					controller: JoinController,
					controllerAs: 'joinC',
					templateUrl: 'js/components/join/join.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true
				})
				.then((joinModel) => {
					this.$window.blur();
					handle.dataService.getClientWall(joinModel, () => {
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
}

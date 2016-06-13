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

		constructor(
			private urlService: IURLService,
			private $translate: any,
			private $mdMedia: IMedia,
			private $mdDialog: IDialogService,
			private $window: IWindowService,
			private dataService: DataService) {
			console.log('--> LandingController: started');
			this.$translate.use(this.urlService.getLanguageDomain());
			this.customFullscreen = this.$mdMedia('xs') || this.$mdMedia('sm');
		}

		/**
		 * display an advanced dialog for the login, and catches it's events
		 */
		showLoginDialog(ev) : void {
			var handle = this;
			//detects if the device is small
			var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
			//show the dialog
			this.$mdDialog.show({
				controller: LoginController,
				controllerAs: 'loginC',
				templateUrl: 'js/components/login/login.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true
			})
			.then(function(answer) {
				//dialog answered
				console.log('--> LandingController: answer: ' + answer);
				handle.$window.location.href = handle.urlService.getHost() + answer;
			}, function() {
				//dialog dismissed
				console.log('--> LandingController: dismissed');
			});
		};

		/**
		 * display dialog for joining with pin and nickname
		 */
		showJoinDialog(ev) : void {
			var handle = this;
			//detects if the device is small
			var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
			//show the dialog
			this.$mdDialog.show({
					controller: JoinController,
					controllerAs: 'joinC',
					templateUrl: 'js/components/join/join.html',
					parent: angular.element(document.body),
					targetEvent: ev,
					clickOutsideToClose: true
				})
				.then(function(joinModel) {
					handle.dataService.getClientWall(joinModel, () => {
						handle.$window.location.href = handle.urlService.getHost() + '/#/wall';
					}, null);
				}, function() {
					//dialog dismissed
					console.log('--> LandingController: dismissed');
				});
		}
	}
}

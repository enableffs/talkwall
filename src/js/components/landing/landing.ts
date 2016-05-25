/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../login/login.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	import IMedia = angular.material.IMedia;
	import IScope = angular.IScope;
	import IWindowService = angular.IWindowService;

	export class LandingController {
		static $inject = ['URLService', '$translate', '$mdMedia', '$mdDialog', '$scope', '$window', 'DataService'];

		private customFullscreen;

		constructor(
			private urlService: IURLService,
			private $translate: any,
			private $mdMedia: IMedia,
			private $mdDialog: IDialogService,
			private isolatedScope: IScope,
			private $window: IWindowService,
			private dataService: DataService) {
			console.log('--> LandingController: started: ');
			this.$translate.use(this.urlService.getDomain());
			this.customFullscreen = this.$mdMedia('xs') || this.$mdMedia('sm');
		}

		showLoginDialog(ev) : void {
			var handle = this;
			var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
			this.$mdDialog.show({
				controller: LoginController,
				controllerAs: 'loginC',
				templateUrl: 'js/components/login/login.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true
			})
			.then(function(answer) {
				//answered
				console.log('--> LandingController: answer: ' + answer);
				handle.$window.location.href = handle.urlService.getURL() + answer;
			}, function() {
				//dismissed
				console.log('--> LandingController: dissmissed');
			});
			this.isolatedScope.$watch(function() {
				return handle.$mdMedia('xs') || handle.$mdMedia('sm');
			}, function(wantsFullScreen) {
				handle.customFullscreen = (wantsFullScreen === true);
			});
		}
	}
}

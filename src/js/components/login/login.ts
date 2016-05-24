/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	import IScope = angular.IScope;
	export class LoginController {
		static $inject = ['$scope', '$mdDialog'];

		constructor(
			private isolatedScope: IScope,
			private $mdDialog: IDialogService) {
			console.log('--> LoginController: started: ');
		}

		hide(): void {
			console.log('--> LoginController: hide');
			this.$mdDialog.hide();
		};
		cancel() : void {
			console.log('--> LoginController: cancel');
			this.$mdDialog.cancel();
		};
		answer(answer): void {
			console.log('--> LoginController: answer: ' + answer);
			this.$mdDialog.hide(answer);
		};
	}
}

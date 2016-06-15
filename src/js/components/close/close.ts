/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	export class CloseController {
		static $inject = ['$mdDialog'];

		private theanswer = {
			answered: true
		};
		constructor(
			private $mdDialog: IDialogService) {
			console.log('--> LoginController: started: ');
		}

		/**
		 * hide this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		hide(response?: any): void {
			console.log('--> JoinController: hide');
			this.$mdDialog.hide();
		};
		/**
		 * cancel this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		cancel(response?: any) : void {
			console.log('--> JoinController: cancel');
			this.$mdDialog.cancel();
		};
		/**
		 * answer this dialog
		 * @aparam answer aa a string
		 */
		answer(): void {
			this.$mdDialog.hide(this.theanswer);
		};
	}
}

/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	export class ArchiveWallController {
		static $inject = ['$mdDialog'];

		private showInput: boolean = false;

		constructor(
			private $mdDialog: IDialogService) {
			console.log('--> LoginController: started: ');
		}

		/**
		 * hide this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		hide(response?: any): void {
			console.log('--> ArchiveWallController: hide');
			this.$mdDialog.hide();
		};
		/**
		 * cancel this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		cancel(response?: any) : void {
			console.log('--> ArchiveWallController: cancel');
			this.$mdDialog.cancel();
		};
		/**
		 * answer this dialog
		 * @aparam answer aa a string
		 */
		answer(answer: string): void {
			console.log('--> ArchiveWallController: answer: ' + answer);
			this.$mdDialog.hide(answer);
		};
	}
}

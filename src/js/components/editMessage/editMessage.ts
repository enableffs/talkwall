/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	import IBottomSheetService = angular.material.IBottomSheetService;
	export class EditMessageController {
		static $inject = ['$mdBottomSheet', 'DataService'];

		constructor(
			private $mdBottomSheet: IBottomSheetService,
			private dataService: DataService) {
			console.log('--> LoginController: started: ');
		}

		/**
		 * hide this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		hide(response?: any): void {
			console.log('--> IBottomSheetService: hide');
			this.$mdBottomSheet.hide();
		};
		/**
		 * cancel this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		cancel(response?: any) : void {
			console.log('--> IBottomSheetService: cancel');
			this.$mdBottomSheet.cancel();
		};
		/**
		 * answer this dialog
		 * @aparam answer aa a string
		 */
		answer(answer: string): void {
			console.log('--> IBottomSheetService: answer: ' + answer);
			if (answer !== undefined) {
				this.$mdBottomSheet.hide(answer);
			} else {
				this.$mdBottomSheet.cancel();
			}
		};
	}
}

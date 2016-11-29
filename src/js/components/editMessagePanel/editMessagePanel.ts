/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	import IBottomSheetService = angular.material.IBottomSheetService;
	import IDocumentService = angular.IDocumentService;
	import ITimeoutService = angular.ITimeoutService;
	export class EditMessageController {
		static $inject = ['$mdBottomSheet', '$document', '$timeout', 'DataService'];

		private messageToEdit: Message;
		private boxHook = null;

		constructor(
			private $mdBottomSheet: IBottomSheetService,
			private $document: IDocumentService,
			private $timeout: ITimeoutService,
			private dataService: DataService) {
			console.log('--> EditMessageController: started: ');

			this.messageToEdit = dataService.getMessageToEdit();

			this.$timeout(() => {
				this.$document[0].activeElement['focus']();
			}, 100);
		}

		/**
		 * hide this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		hide(response?: any): void {
			console.log('--> EditMessageController: hide');
			this.dataService.setMessageToEdit(null);
			this.$document[0].activeElement['blur']();
			this.$mdBottomSheet.hide();
		};
		/**
		 * cancel this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		cancel(response?: any) : void {
			console.log('--> EditMessageController: cancel');
			this.dataService.setMessageToEdit(null);
			this.$document[0].activeElement['blur']();
			this.$mdBottomSheet.cancel();
		};
		/**
		 * answer this dialog
		 * @aparam answer aa a string
		 */
		answer(answer: boolean): void {
			console.log('--> EditMessageController: answer: ' + answer);
			this.$document[0].activeElement['blur']();
			if (answer !== undefined) {
				this.$mdBottomSheet.hide(answer);
			} else {
				this.$mdBottomSheet.cancel();
			}
			this.messageToEdit = null;
		};
	}
}

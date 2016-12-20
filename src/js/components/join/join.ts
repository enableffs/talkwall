/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	import IDocumentService = angular.IDocumentService;
	export class JoinController {
		static $inject = ['$mdDialog', '$document'];

		public joinModel = {
			nickname: "",
			pin: NaN
		};
		constructor(
			private $mdDialog: IDialogService,
			private $document: IDocumentService) {
				console.log('--> LoginController: started: ');
		}

		/**
		 * hide this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		hide(response?: any): void {
			console.log('--> JoinController: hide');
			this.$document[0].activeElement['blur']();
			this.$mdDialog.hide();
		};
		/**
		 * cancel this dialog (see angular.material.IDialogService)
		 * @aparam response a possible reponse
		 */
		cancel(response?: any) : void {
			this.$document[0].activeElement['blur']();
			console.log('--> JoinController: cancel');
			this.$mdDialog.cancel();
		};
		/**
		 * answer this dialog
		 * @aparam answer aa a string
		 */
		answer(): void {
			if (this.joinModel.nickname.length > 0 && this.joinModel.pin > 999 && this.joinModel.pin < 10000) {
				this.$document[0].activeElement['blur']();
				this.$mdDialog.hide(this.joinModel);
			}
		};
	}
}

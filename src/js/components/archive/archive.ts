"use strict";
import IDialogService = angular.material.IDialogService;
import {DataService} from "../../services/dataservice";

export class ArchiveWallController {
	static $inject = ['$mdDialog', 'DataService'];

	private showInput: boolean = false;
	private owneremail: string = undefined;

	constructor(
		private $mdDialog: IDialogService,
		private dataService: DataService) {
		console.log('--> LoginController: started: ');

		if (this.dataService.getAuthenticatedUser().defaultEmail !== undefined && this.dataService.getAuthenticatedUser().defaultEmail !== '') {
			this.owneremail = this.dataService.getAuthenticatedUser().defaultEmail;
		}
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

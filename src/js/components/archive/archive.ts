/*
 Copyright 2016, 2017 Richard Nesnass and Jeremy Toussaint

 This file is part of Talkwall.

 Talkwall is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Talkwall is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Talkwall.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
import IDialogService = angular.material.IDialogService;
import {DataService} from "../../services/dataservice";

export class ArchiveWallController implements angular.IController {
	static $inject = ['$mdDialog', 'DataService'];

	private showInput: boolean = false;
	private owneremail: string = undefined;

	$onInit() { }

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

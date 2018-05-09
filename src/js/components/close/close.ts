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

import IDialogService = angular.material.IDialogService;
export class CloseController implements angular.IController {
	static $inject = ['$mdDialog'];

	$onInit() { }

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
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

import IBottomSheetService = angular.material.IBottomSheetService;
import IDocumentService = angular.IDocumentService;
import ITimeoutService = angular.ITimeoutService;
import {DataService} from "../../services/dataservice";
import { IController } from "angular";

export class EditMessageController implements IController {
	static $inject = ['$mdBottomSheet', '$document', '$timeout', 'DataService'];

	private messageText = '';

	$onInit() { } 
	
	constructor(
		private $mdBottomSheet: IBottomSheetService,
		private $document: IDocumentService,
		private $timeout: ITimeoutService,
		private dataService: DataService) {
		console.log('--> EditMessageController: started: ');

		this.messageText = dataService.data.status.messageToEdit.text;

		this.$timeout(() => {
			this.$document[0].activeElement['focus']();
		}, 100);
	}

	/**
	 * cancel this dialog (see angular.material.IDialogService)
	 * @aparam response a possible reponse
	 */
	cancel(response?: any) : void {
		console.log('--> EditMessageController: cancel');
		this.$document[0].activeElement['blur']();
		this.$mdBottomSheet.cancel();
	};
	/**
	 * answer this dialog
	 * @aparam answer aa a string
	 */
	answer(): void {
		this.dataService.data.status.messageToEdit.text = this.messageText;
		console.log('--> EditMessageController: answered: ');
		this.$document[0].activeElement['blur']();
		this.$mdBottomSheet.hide();
	};
}


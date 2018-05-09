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
import IDocumentService = angular.IDocumentService;
import {TalkwallConstants} from "../../app.constants";

let constants = TalkwallConstants.Constants;

export class JoinController implements angular.IController {
	static $inject = ['$mdDialog', '$document'];

	$onInit() { }
	
	private maxNicknameChars: number;
    public joinModel = {
		nickname: "",
		pin: NaN
	};
	constructor(
		private $mdDialog: IDialogService,
		private $document: IDocumentService) {
			console.log('--> LoginController: started: ');
		this.maxNicknameChars = constants['MAX_NICKNAME_CHARS'];
	}

    /**
     * ensure the nickname includes only desired characters
     */
    filterNickname(): void {
        this.joinModel.nickname = this.joinModel.nickname.replace(/([\u002E]?|[#0-9]\u20E3)|[\x2e\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?/g, '');
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
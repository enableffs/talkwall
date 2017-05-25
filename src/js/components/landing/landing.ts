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
import IMedia = angular.material.IMedia;
import IWindowService = angular.IWindowService;
import {URLService} from "../../services/urlservice";
import {DataService} from "../../services/dataservice";
import {LoginController} from "../login/login";
import {JoinController} from "../join/join";
import IDialogOptions = angular.material.IDialogOptions;

export class LandingController {
	static $inject = ['URLService', '$translate', '$mdMedia', '$mdDialog', '$window', 'DataService'];

	//vars
	private customFullscreen: boolean;
	private languageCode: string = 'no';

	constructor(
		private urlService: URLService,
		private $translate: any,
		private $mdMedia: IMedia,
		private $mdDialog: IDialogService,
		private $window: IWindowService,
		private dataService: DataService) {
		console.log('--> LandingController: started');
		let langKey: string = 'lang';
		this.languageCode = this.$window.sessionStorage[langKey];
		this.$translate.use(this.languageCode);
		this.customFullscreen = this.$mdMedia('xs') || this.$mdMedia('sm');
	}

	/**
	 * display an advanced dialog for the login, and catches it's events
	 */
	showLoginDialog(ev: MouseEvent) : void {
		let handle = this;
		let dialogOptions: IDialogOptions = {
			controller: LoginController,
			controllerAs: 'loginC',
			templateUrl: 'js/components/login/login.html',
			targetEvent: ev,
			clickOutsideToClose: true
		};
		//detects if the device is small
		// let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
		//show the dialog
		this.$mdDialog.show(dialogOptions)
		.then((answer) => {
			this.$window.blur();
			//dialog answered
			console.log('--> LandingController: answer: ' + answer);
			handle.$window.location.href = handle.urlService.getHost() + answer;
		}, () => {
			this.$window.blur();
			//dialog dismissed
			console.log('--> LandingController: dismissed');
		});
	};

	/**
	 * display dialog for joining with pin and nickname
	 */
	showJoinDialog(ev: MouseEvent) : void {
		let handle = this;
		let dialogOptions: IDialogOptions = {
			controller: JoinController,
			controllerAs: 'joinC',
			templateUrl: 'js/components/join/join.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose: true
		};
		//detects if the device is small
		// let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
		//show the dialog
		this.$mdDialog.show(dialogOptions)
			.then((answer) => {
				this.$window.blur();
				handle.dataService.connectClientWall(answer, () => {
					handle.dataService.data.status.joinedWithPin = true;
					handle.$window.location.href = handle.urlService.getHost() + '/#/wall';
				}, () => {

				});
			}, () => {
				this.$window.blur();
				//dialog dismissed
				console.log('--> LandingController: dismissed');
			});
	}
}
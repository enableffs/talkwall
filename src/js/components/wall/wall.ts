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
import IBottomSheetService = angular.material.IBottomSheetService;
import ISidenavService = angular.material.ISidenavService;
import IWindowService = angular.IWindowService;
import IScope = angular.IScope;
import {Question, LogType, Message, Wall} from "../../models/models";
import {EditMessageController} from "../editMessagePanel/editMessagePanel";
import {URLService} from "../../services/urlservice";
import {DataService} from "../../services/dataservice";
import {UtilityService} from "../../services/utilityservice";
import IDialogOptions = angular.material.IDialogOptions;
import { IController } from "angular";

export interface IWallControllerService {
	/**
	 * init function for this controller
	 */
	activate(): void;
	/**
	 * Pop up bottom sheet to edit messages. Slide out left sidenav also
	 */
	showMessageEditor(newMessage: boolean): void;
	/**
	 * Switch to magnifyFeed board mode. Affects code in feedMessage controller
	 */
	magnifyTheBoard(): void;
	/**
	 * Toggles which right menu should be open
	 */
	toggleRightMenu(index: number, event: Event): void;
	/**
	 * Add a new question
	 */
	addQuestion(event: Event): void;
	/**
	 * Update a question
	 */
	saveQuestion(event: Event): void;
	/**
	 * Get question at index
	 * @param index wall.questions Index of the question being selected
	 */
	setQuestion(index: number, event: Event): void;
	/**
	 * Check if question has been edited
	 */
	questionToEditDirty(): boolean;
	/**
	 * Change the grid type
	 */
	setGrid(type: string, event: Event): void;

	contributorExists(item: string): boolean;
	contributorToggle(item: string, event: Event): void;
	aContributorIsChecked(): boolean;
	toggleAllContributors(event: Event): void;

	tagExists(item: string): boolean;
	tagToggle(item: string, event: Event): void;
	tagIsChecked(): boolean;
	toggleAllTags(event: Event): void;

	showScreenParticipants(event: Event): void;
	showFeed(event: Event): void;
}

export class WallController implements IWallControllerService, IController {
	static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', '$scope', '$timeout', 'URLService', '$window', 'UtilityService'];
	private magnifyFeed: boolean = false;
	private magnifyBoard: boolean = false;
	private feedView: boolean = false;
	private participantView: boolean = false;
	private rightMenu1: boolean = false;
	private rightMenu2: boolean = false;
	private rightMenu3: boolean = false;
	private rightMenu4: boolean = false;
	private owneremail: string = undefined;
	private closeOnExit: boolean = true;

	private savedGridType: string = 'none';
	private selectedParticipant: string;

	public messageFilterByContributorOnBoard: (Message: Message) => boolean;
	public messageFilterByAuthorAndTag: (Message: Message) => boolean;

	private noTag = 'no tag';

	$onInit() { } 
	constructor(
		private dataService: DataService,
		private $mdSidenav: ISidenavService,
		private $mdBottomSheet: IBottomSheetService,
		private $translate: angular.translate.ITranslateService,
		private $scope: IScope,
		private $timeout: angular.ITimeoutService,
		private urlService: URLService,
		private $window: IWindowService,
		private utilityService: UtilityService) {
		console.log('--> WallController: started: ');

		$translate('NO_TAG').then( (translation) => {
			this.noTag = translation;
		});

		// Run this activation code each time the wall view is opened
		let handle = this;
		$scope.$on('$routeChangeSuccess', function(event, current, previous) {
			if(current.$$route.originalPath === '/wall') {
				handle.activate();
			}
		});
	}

	magnifyTheBoard(): void {
		this.magnifyBoard = !this.magnifyBoard;
	}

	activate(): void {
		if (this.dataService.data.wall === null) {
			this.$window.location.href = this.urlService.getHost() + '/#/';
		} else {

			// Set event to trigger a server disconnect if the window is closed / tab is closed
			let clientType = this.dataService.data.status.authorised ? 'disconnectteacher/' : 'disconnect/';
			let disconnectUrl = this.urlService.getHost() + '/' + clientType + this.dataService.data.user.nickname
				+ '/' + this.dataService.data.wall._id;
			this.$window.addEventListener('beforeunload', function() {
				let xmlHttp = new XMLHttpRequest();
				xmlHttp.open( "GET", disconnectUrl, false ); // false for synchronous request
				xmlHttp.send( null );
				return xmlHttp.responseText;
			});


			/*
			this.$window.onbeforeunload = () => {
				let url = this.urlService.getHost() + '/';
				let clientType = this.data.status.authorised ? 'disconnectteacher/' : 'disconnect/';
				this.$http.get(url + clientType + this.data.user.nickname + '/' + this.data.wall._id + '/' + this.data.question._id)
                    .then(function () {
						this.$window.location.href = url;
					});
			};
			*/

			let question_index = -1;
			if (this.dataService.data.wall.questionIndex !== -1) {
				question_index = this.dataService.data.wall.questionIndex;
			} else {
				question_index = this.dataService.data.wall.questions.length > 0 ? 0 : -1;
			}
			this.setQuestion(question_index);
			this.selectedParticipant = this.dataService.data.user.nickname;
			this.dataService.data.status.selectedParticipant = this.selectedParticipant;

			this.$scope.$watch(() => { return this.selectedParticipant }, (newVar, oldVar) => {
				if(newVar !== oldVar) {
					this.dataService.data.status.selectedParticipant = newVar;
					this.dataService.logAnEvent(LogType.SelectWall, this.dataService.data.question._id, null, newVar, null, '');
					this.dataService.getMessages(null, null);
				}
			}, true);

			if (this.dataService.data.status.authorised &&
				this.dataService.getAuthenticatedUser().defaultEmail !== undefined &&
				this.dataService.getAuthenticatedUser().defaultEmail !== '') {
				this.owneremail = this.dataService.getAuthenticatedUser().defaultEmail;
			}

			let handle = this;
			//contributor filtering (for messages on the board)
			this.messageFilterByContributorOnBoard = function(message: Message) {
				return (!message.deleted &&
					!handle.dataService.data.status.phoneMode &&
					typeof message.board !== 'undefined' &&
					typeof message.board[handle.selectedParticipant] !== 'undefined' &&
					handle.dataService.data.status.unselected_contributors.indexOf(message.creator) === -1 &&
					handle.messageTagsNotPresent(message));
			};

			//author+tag filtering (for messages in the feed)
			this.messageFilterByAuthorAndTag = function(message: Message) {
				return (!message.deleted && handle.dataService.data.status.unselected_contributors.indexOf(message.creator) === -1 && handle.messageTagsNotPresent(message));
			};

			this.$timeout(() => {
				this.showFeed();
				if (this.dataService.data.status.authorised) {
					if (question_index === -1) {
						this.rightMenu3 = true;
					} else {
						this.rightMenu1 = true;
					}
					this.$mdSidenav('right').open();
				}
			}, 2000);
		}
	}

	hideMessageInParticipantView(message: Message): boolean {
		return this.participantView && (typeof message.board[this.selectedParticipant] === 'undefined');
	}

	messageTagsNotPresent(message: Message): boolean {
		let messageTags = this.utilityService.extractHashtags(message.text);
		if (messageTags.length > 0) {
			let present: boolean = false;
			for (let i = 0; i < messageTags.length; i++) {
				if (this.dataService.data.status.unselected_tags.indexOf(messageTags[i]) === -1) {
					present = true;
				}
			}
			return present;
		} else {
			return this.dataService.data.status.unselected_tags.indexOf(this.noTag) === -1;
		}
	}

	showFeed(): void {
		this.feedView = true;
		this.participantView = false;
		this.selectedParticipant = this.dataService.data.user.nickname;
		this.dataService.data.status.selectedParticipant = this.selectedParticipant;
		this.$mdSidenav('left').open();
	}

	showScreenParticipants(): void {
		this.magnifyFeed = false;
		this.feedView = false;
		this.participantView = true;
		this.$mdSidenav('left').open();
	}

	setQuestion(index: number) {
		this.dataService.setQuestion(index,
			() => {
				if ( this.dataService.data.status.currentQuestionIndex !== -1 ) {
					this.savedGridType = this.dataService.data.question.grid;
				}
			},
			function() {
				//error
			}
		);
	}

	toggleLock() {
		this.closeOnExit = !this.closeOnExit;
	}

	exitWall() {
		if (this.dataService.data.status.authorised && this.closeOnExit && !this.dataService.data.wall.closed) {
			this.dataService.data.wall.closed = true;
			this.dataService.updateWall(null, () => {
				this.dataService.disconnectFromWall(null, null);
			}, () => {
				console.log('error updating wall');
			});
		} else {
			this.dataService.disconnectFromWall(null, null);
		}
	}

	setGrid(type: string): void {
		this.dataService.data.status.questionToEdit.grid = type;
	}

	questionToEditDirty() {
		if (this.dataService.data.status.questionToEdit === null || this.dataService.data.question === null) {
			return true;
		} else {
			return (this.dataService.data.status.questionToEdit.label !== this.dataService.data.question.label
				&& this.dataService.data.status.questionToEdit.label !== '')
				|| typeof this.dataService.data.status.questionToEdit._id !== 'undefined';
		}
	}

	/**** contributor filtering ******/
	contributorExists(item: string) {
		return this.dataService.data.status.unselected_contributors.indexOf(item) === -1;
	};

	contributorToggle(item: string) {
		let idx = this.dataService.data.status.unselected_contributors.indexOf(item);
		if (idx > -1) {
			this.dataService.data.status.unselected_contributors.splice(idx, 1);
		} else {
			this.dataService.data.status.unselected_contributors.push(item);
		}
	};

	aContributorIsChecked() {
		return this.dataService.data.status.unselected_contributors.length < this.dataService.data.status.contributors.length;
	};

	toggleAllContributors() {
		if (this.dataService.data.status.unselected_contributors.length === this.dataService.data.status.contributors.length) {
			this.dataService.data.status.unselected_contributors = [];
		} else {
			this.dataService.data.status.unselected_contributors = this.dataService.data.status.contributors.slice(0);
		}
	};
	/**** end contributor filtering ******/


	/**** tag filtering ******/
	tagExists(item: string) {
		return this.dataService.data.status.unselected_tags.indexOf(item) === -1;
	};

	tagToggle(item: string) {
		let idx = this.dataService.data.status.unselected_tags.indexOf(item);
		if (idx > -1) {
			this.dataService.data.status.unselected_tags.splice(idx, 1);
		} else {
			this.dataService.data.status.unselected_tags.push(item);
		}
	};

	tagIsChecked() {
		return this.dataService.data.status.unselected_tags.length !== this.dataService.data.status.tags.length;
	};

	toggleAllTags() {
		if (this.dataService.data.status.unselected_tags.length === this.dataService.data.status.tags.length) {
			this.dataService.data.status.unselected_tags = [];
		} else {
			this.dataService.data.status.unselected_tags = this.dataService.data.status.tags.slice(0);
		}
	};
	/**** end tag filtering ******/

	participantIsActive(p: string) {
		return this.dataService.data.status.activeParticipants.indexOf(p) > -1;
	}

	showMessageEditor(newMessage: boolean): void {
		let basedOnText: string = '';
		let dialogOptions: IDialogOptions = {
			controller: EditMessageController,
			controllerAs: 'editMessageC',
			clickOutsideToClose: false,
			templateUrl: 'js/components/editMessagePanel/editMessagePanel.html'
		};
		if (newMessage) {
			this.dataService.setMessageToEdit(null);
		} else {
			basedOnText = this.dataService.data.status.messageToEdit.text;
		}

		this.$mdBottomSheet.show(dialogOptions).then(() => {
			this.$window.document.activeElement['blur']();

			let message = this.dataService.data.status.messageToEdit;

			// We created a new message, possibly a copy of someone else's
			if (typeof message._id === 'undefined') {
				this.dataService.addMessage( null, null);
				this.showFeed();
			}

			// We edited our own existing message
			else {
				this.dataService.logAnEvent(LogType.EditMessage, message._id, null, message.text, null, basedOnText);
				this.dataService.updateMessages([message], 'edit');
			}
		}, () => {
			//dialog dismissed
			this.$window.document.activeElement['blur']();
		});
	}

	closeLeftSidenav() {
		this.participantView = false;
		this.feedView = false;
		this.$mdSidenav('left').close();
	}

	togglemagnifyFeed() {
		this.magnifyFeed = !this.magnifyFeed;
	}

	toggleRightMenu(n: number): void {
		console.log('--> WallController: toggleRightMenu: ' + n);
		switch (n) {
			case 1:
				this.rightMenu1 = !this.rightMenu1;
				this.rightMenu2 = false;
				this.rightMenu3 = false;
				this.rightMenu4 = false;
				break;
			case 2:
				this.rightMenu1 = false;
				this.rightMenu2 = !this.rightMenu2;
				this.rightMenu3 = false;
				this.rightMenu4 = false;
				//this.selected_users = this.dataService.getParticipants().slice(0);
				break;
			case 3:
				this.rightMenu1 = false;
				this.rightMenu2 = false;
				this.rightMenu3 = !this.rightMenu3;
				this.rightMenu4 = false;
				break;
			case 4:
				this.rightMenu1 = false;
				this.rightMenu2 = false;
				this.rightMenu3 = false;
				this.rightMenu4 = !this.rightMenu4;
				break;
			default:
				this.rightMenu1 = false;
				this.rightMenu2 = false;
				this.rightMenu3 = false;
				this.rightMenu4 = false;
		}
	}

	addQuestion(): void {
		this.dataService.data.status.questionToEdit = new Question('');
		this.dataService.data.status.questionToEdit.isNew = true;
	}

	cancelEditQuestion(): void {
		this.dataService.data.status.questionToEdit = null;
	}

	saveQuestion(): void {
		if(this.dataService.data.status.questionToEdit.isNew) {
			this.dataService.addQuestion(
				() => {
					//set to the new question if none
					if (this.dataService.data.question === null) {
						this.setQuestion(0);
					}
					//clear the question to edit ...
					this.dataService.setQuestionToEdit(null);
				},
				() => {
					//TODO: handle question retrieval error
				}
			);
		} else {
			this.dataService.updateQuestion(
				() => {
					//set to the new question if none
					if (this.dataService.data.question === null) {
						this.setQuestion(0);
					}
					//clear the question to edit ...
					this.dataService.setQuestionToEdit(null);
				},
				() => {
					//TODO: handle question retrieval error
				}
			);
		}
	}

}
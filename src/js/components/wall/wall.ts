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
	 * Switch to magnified board mode. Affects code in feedMessage controller
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

	showScreenContributors(event: Event): void;
	showFeed(event: Event): void;
}

export class WallController implements IWallControllerService {
	static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', '$scope', '$timeout', 'URLService', '$window', 'UtilityService'];
	private magnified: boolean = false;
	private magnifyBoard: boolean = false;
	private feedView: boolean = true;
	private rightMenu1: boolean = false;
	private rightMenu2: boolean = false;
	private rightMenu3: boolean = false;
	private rightMenu4: boolean = false;
	private owneremail: string = undefined;
	private closeOnExit: boolean = false;

	private savedGridType: string = 'none';
	private selectedParticipant: string;

	public messageFilterByContributorOnBoard: (Message: Message) => boolean;
	public messageFilterByAuthorAndTag: (Message: Message) => boolean;

	private noTag = 'no tag';

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
					this.dataService.refreshBoardMessages();
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
				this.rightMenu1 = true;
				if (this.dataService.data.status.authorised) {
					this.rightMenu1 = true;
					this.$mdSidenav('right').open();
				}
			}, 2000);
		}
	}

	messageTagsNotPresent(message: Message): boolean {
		let messageTags = this.utilityService.getPossibleTags(message.text);
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
		this.selectedParticipant = this.dataService.data.user.nickname;
		this.dataService.data.status.selectedParticipant = this.selectedParticipant;
		this.$mdSidenav('left').open();
	}

	showScreenContributors(): void {
		this.magnified = false;
		this.feedView = false;
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
		if(this.closeOnExit && !this.dataService.data.wall.closed) {
			this.dataService.data.wall.closed = true;
			this.dataService.updateWall(null, () => {
				this.dataService.data.wall = null;
				this.dataService.data.question = null;
				this.$window.location.href = this.urlService.getHost() + '/#/organiser';
			}, () => {
				console.log('error updating wall');
			});
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

	showMessageEditor(newMessage: boolean): void {
		let handle = this;
		let dialogOptions: IDialogOptions = {
			controller: EditMessageController,
			controllerAs: 'editMessageC',
			clickOutsideToClose: false,
			templateUrl: 'js/components/editMessagePanel/editMessagePanel.html'
		};
		if (newMessage) {
			handle.dataService.setMessageToEdit(null);
		}

		//this.dataService.stopPolling();
		//this.showFeed(null);
		this.$mdBottomSheet.show(dialogOptions).then(() => {
			//dialog answered
			this.$window.document.activeElement['blur']();
			//post message to server and add returned object to question feed
			let message = handle.dataService.data.status.messageToEdit;
			if(message !== null) {
				if (typeof message._id === 'undefined') {
					console.log('--> WallController: Edit message - created');
					let origin: {}[] = [];
					let basedOnText: string = '';
					if (this.dataService.data.status.messageOrigin !== null) {
						origin = this.dataService.data.status.messageOrigin.origin;
						basedOnText = this.dataService.data.status.messageOrigin.text;
					}
					this.dataService.logAnEvent(LogType.CreateMessage, message._id, null, message.text, origin, basedOnText);
					handle.dataService.addMessage(
						function () {
							//success
						},
						function () {
							//TODO: handle message create error
						}
					);
				} else {
					console.log('--> WallController: Edit message - edited');
					this.dataService.logAnEvent(LogType.EditMessage, message._id, null, message.text, null, '');
					handle.dataService.updateMessages([message], 'edit');
				}
			}
			//handle.dataService.startPolling();
		}, () => {
			//dialog dismissed
			this.$window.document.activeElement['blur']();
			console.log('--> WallController: Edit message dismissed');
			handle.dataService.clearMessageToEdit();
			//handle.dataService.startPolling();
		});
	}

	closeLeftSidenav() {
		this.$mdSidenav('left').close();
		this.magnified = false;
	}

	toggleMagnified() {
		this.magnified = !this.magnified;
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
/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../../services/utilityservice.ts"/>
/// <reference path="../editMessagePanel/editMessagePanel.ts"/>

module TalkwallApp {
	"use strict";
	import IBottomSheetService = angular.material.IBottomSheetService;
	import ISidenavService = angular.material.ISidenavService;
	import IWindowService = angular.IWindowService;
	import IScope = angular.IScope;

	export interface IWallControllerService {
		/**
		 * init function for this controller
		 */
		activate(): void;
		/**
		 * Pop up bottom sheet to edit messages. Slide out left sidenav also
		 */
		showMessageEditor(newMessage: boolean, event: Event): void;
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

        private savedGridType: string = 'none';
		private selectedParticipant: string;

        public messageFilterByContributorOnBoard: (Message) => boolean;
		public messageFilterByAuthorAndTag: (Message) => boolean;

        private noTag = 'no tag';

        constructor(
			private dataService: DataService,
			private $mdSidenav: ISidenavService,
			private $mdBottomSheet: IBottomSheetService,
			private $translate: angular.translate.ITranslateService,
			private $scope: IScope,
			private $timeout: angular.ITimeoutService,
			private urlService: IURLService,
			private $window: IWindowService,
			private utilityService: UtilityService) {
			console.log('--> WallController: started: ');

            $translate('NO_TAG').then( (translation) => {
                this.noTag = translation;
            });

	        this.dataService.checkAuthentication(() => {
				this.activate();
			}, null);

		}

		magnifyTheBoard(): void {
        	this.magnifyBoard = !this.magnifyBoard;
		}

		activate(): void {
			if (this.dataService.data.wall === null) {
				this.$window.location.href = this.urlService.getHost() + '/#/';
			} else {
				let question_index = this.dataService.data.wall.questions.length > 0 ? 0 : -1;
				this.setQuestion(question_index, null);
				this.selectedParticipant = this.dataService.data.status.nickname;
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
					this.showFeed(null);
					this.rightMenu1 = true;
					if (this.dataService.data.status.authorised && this.dataService.data.question !== null) {
						this.$mdSidenav('right').open();
					}
				}, 2000);
			}
		}

		messageTagsNotPresent(message): boolean {
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

		showFeed(event): void {
        	if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.feedView = true;
			this.selectedParticipant = this.dataService.data.status.nickname;
			this.dataService.data.status.selectedParticipant = this.selectedParticipant;
			this.$mdSidenav('left').open();
		}

		showScreenContributors(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.magnified = false;
			this.feedView = false;
			this.$mdSidenav('left').open();
		}

        setQuestion(index, event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
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

		closeWall(targetEmail, event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.dataService.closeWallNow(targetEmail);
			this.owneremail = undefined;
		}

        setGrid(type, event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
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
        contributorExists(item) {
            return this.dataService.data.status.unselected_contributors.indexOf(item) === -1;
        };

		contributorToggle(item, event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
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

        toggleAllContributors(event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
            if (this.dataService.data.status.unselected_contributors.length === this.dataService.data.status.contributors.length) {
				this.dataService.data.status.unselected_contributors = [];
            } else {
				this.dataService.data.status.unselected_contributors = this.dataService.data.status.contributors.slice(0);
            }
        };
		/**** end contributor filtering ******/


		/**** tag filtering ******/
		tagExists(item) {
			return this.dataService.data.status.unselected_tags.indexOf(item) === -1;
		};

		tagToggle(item, event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
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

		toggleAllTags(event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			if (this.dataService.data.status.unselected_tags.length === this.dataService.data.status.tags.length) {
				this.dataService.data.status.unselected_tags = [];
			} else {
				this.dataService.data.status.unselected_tags = this.dataService.data.status.tags.slice(0);
			}
		};
		/**** end tag filtering ******/

		showMessageEditor(newMessage: boolean, event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			let handle = this;
			if (newMessage) {
                handle.dataService.setMessageToEdit(null);
			}

            //this.dataService.stopPolling();
            //this.showFeed(null);
			this.$mdBottomSheet.show({
				controller: EditMessageController,
				controllerAs: 'editMessageC',
				clickOutsideToClose: false,
				templateUrl: 'js/components/editMessagePanel/editMessagePanel.html'
			}).then(() => {
				//dialog answered
				this.$window.document.activeElement['blur']();
				//post message to server and add returned object to question feed
				let message = handle.dataService.getMessageToEdit();
				if(message !== null) {
					if (typeof message._id === 'undefined') {
						console.log('--> WallController: Edit message - created');
						this.dataService.logAnEvent(LogType.CreateMessage, message._id, null);
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
						this.dataService.logAnEvent(LogType.EditMessage, message._id, null);
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

		closeLeftSidenav(event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.$mdSidenav('left').close();
			this.magnified = false;
		}

		toggleMagnified(event) {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.magnified = !this.magnified;
		}

		toggleRightMenu(n: number, event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
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

		addQuestion(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.dataService.data.status.questionToEdit = new Question('');
			this.dataService.data.status.questionToEdit.isNew = true;
		}

		cancelEditQuestion(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.dataService.data.status.questionToEdit = null;
		}

		saveQuestion(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			if(this.dataService.data.status.questionToEdit.isNew) {
				this.dataService.addQuestion(
					() => {
						//set to the new question if none
						if (this.dataService.data.question === null) {
							this.setQuestion(0, null);
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
							this.setQuestion(0, null);
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
}

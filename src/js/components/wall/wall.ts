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
		 * Toggles which right menu should be open
		 */
		toggleRightMenu(index: number): void;
		/**
		 * Post a new question
		 */
		postQuestion(update: boolean): void;
        /**
         * Get question at index
         * @param index wall.questions Index of the question being selected
         */
        setQuestion(index: number): void;
        /**
         * Check if question has been edited
         */
        questionToEditDirty(): boolean;
        /**
         * Change the grid type
         */
        setGrid(type: string): void;

        userExists(item: string): boolean;
        userToggle(item: string): void;
        userIsChecked(): boolean;
        toggleAll(): void;

		tagExists(item: string): boolean;
		tagToggle(item: string): void;
		tagIsChecked(): boolean;
		toggleAllTags(): void;

		showScreenContributors(): void;
		showFeed(): void;
	}

	export class WallController implements IWallControllerService {
		static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', 'URLService', '$window', 'UtilityService'];
		private magnified: boolean = false;
		private feedView: boolean = true;
		private rightMenu1: boolean = false;
		private rightMenu2: boolean = false;
		private rightMenu3: boolean = false;
        private rightMenu4: boolean = false;
		private owneremail: string = undefined;

        private savedGridType: string = 'none';
		private selectedContributor: string;

        private unselected_users: Array<string>;
		private unselected_tags: Array<string>;

        public messageFilterByContributorOnBoard: (Message) => boolean;
		public messageFilterByAuthorAndTag: (Message) => boolean;

        private noTag = 'no tag';

        constructor(
			private dataService: DataService,
			private $mdSidenav: ISidenavService,
			private $mdBottomSheet: IBottomSheetService,
			private $translate: angular.translate.ITranslateService,
			private urlService: IURLService,
			private $window: IWindowService,
			private utilityService: UtilityService) {
			console.log('--> WallController: started: ');

            $translate('NO_TAG').then( (translation) => {
                this.noTag = translation;
            });

            this.unselected_users = [];
	        this.unselected_tags = [];
	        this.dataService.checkAuthentication(() => {
				this.activate();
			}, null);
		}


		activate(): void {
			if (this.dataService.getWall() === null) {
				this.$window.location.href = this.urlService.getHost() + '/#/';
			} else {
				let question_index = this.dataService.getWall().questions.length > 0 ? 0 : -1;
				this.setQuestion(question_index);
				if (this.dataService.data.status.authorised) {
	                this.rightMenu3 = true;
	                this.$mdSidenav('right').open();
				}
				this.selectedContributor = this.dataService.data.status.nickname;

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
						message.board !== undefined &&
						message.board[handle.selectedContributor] !== undefined &&
						handle.unselected_users.indexOf(message.creator) === -1 &&
						handle.messageTagsNotPresent(message));
				};

				//author+tag filtering (for messages in the feed)
				this.messageFilterByAuthorAndTag = function(message: Message) {
					return (!message.deleted && handle.unselected_users.indexOf(message.creator) === -1 && handle.messageTagsNotPresent(message));
				};

			}
		}

		messageTagsNotPresent(message): boolean {
			let messageTags = this.utilityService.getPossibleTags(message.text);
			if (messageTags !== null) {
				let present: boolean = false;
				for (let i = 0; i < messageTags.length; i++) {
					if (this.unselected_tags.indexOf(messageTags[i]) === -1) {
						present = true;
					}
				}
				return present;

			} else {
				return this.unselected_tags.indexOf(this.noTag) === -1;
			}
		}

		showFeed(): void {
			this.feedView = true;
			this.selectedContributor = this.dataService.data.status.nickname;
			this.$mdSidenav('left').open();
		}

		showScreenContributors(): void {
			this.magnified = false;
			this.feedView = false;
			this.$mdSidenav('left').open();
		}

        setQuestion(index) {
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

		closeWall(targetEmail) {
			this.dataService.closeWallNow(targetEmail);
			this.owneremail = undefined;
		}

        setGrid(type): void {
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

        /**** author filtering ******/
        userExists(item) {
            return this.unselected_users.indexOf(item) === -1;
        };

		userToggle(item) {
            let idx = this.unselected_users.indexOf(item);
            if (idx > -1) {
                this.unselected_users.splice(idx, 1);
            } else {
                this.unselected_users.push(item);
            }
        };

        userIsChecked() {
            return this.unselected_users.length !== this.dataService.data.status.participants.length;
        };

        toggleAll() {
            if (this.unselected_users.length === this.dataService.data.status.participants.length) {
                this.unselected_users = [];
            } else {
                this.unselected_users = this.dataService.data.status.participants.slice(0);
            }
        };
		/**** author filtering ******/


		/**** tag filtering ******/
		tagExists(item) {
			return this.unselected_tags.indexOf(item) === -1;
		};

		tagToggle(item) {
			let idx = this.unselected_tags.indexOf(item);
			if (idx > -1) {
				this.unselected_tags.splice(idx, 1);
			} else {
				this.unselected_tags.push(item);
			}
		};

		tagIsChecked() {
			return this.unselected_tags.length !== this.dataService.data.status.tags.length;
		};

		toggleAllTags() {
			if (this.unselected_tags.length === this.dataService.data.status.tags.length) {
				this.unselected_tags = [];
			} else {
				this.unselected_tags = this.dataService.data.status.tags.slice(0);
			}
		};
		/**** tag filtering ******/

		showMessageEditor(newMessage: boolean): void {
			let handle = this;
			if (newMessage) {
                handle.dataService.setMessageToEdit(null);
			}

            this.dataService.stopPolling();
            this.showFeed();
			this.$mdBottomSheet.show({
				controller: EditMessageController,
				controllerAs: 'editMessageC',
				clickOutsideToClose: false,
				templateUrl: 'js/components/editMessagePanel/editMessagePanel.html'
			}).then((answer) => {
				//dialog answered
				console.log('--> WallController: answer: ' + answer);
				this.$window.document.activeElement['blur']();
				//post message to server and add returned object to question feed
                if (handle.dataService.getMessageToEdit()._id === undefined) {
                    handle.dataService.addMessage(
                        function () {
                            //success
                        },
                        function () {
                            //TODO: handle message create error
                        }
                    );
                } else {
                    handle.dataService.updateMessage();
                }
                handle.dataService.startPolling('none', 'none');
			}, () => {
				//dialog dismissed
				this.$window.document.activeElement['blur']();
				console.log('--> WallController: dismissed');
				handle.dataService.setMessageOrigin(null);
                handle.dataService.startPolling('none', 'none');
			});
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

		postQuestion(update: boolean): void {
			if (update) {
				this.dataService.updateQuestion(
					() => {
						//set to the new question if none
						if (this.dataService.data.question === null) {
							this.setQuestion(0);
						}
						//clear the question to edit ...
						this.dataService.setQuestionToEdit(new Question(''));
					},
					() => {
						//TODO: handle question retrieval error
					}
				);
			} else {
				this.dataService.addQuestion(
					() => {
						//set to the new question if none
						if (this.dataService.data.question === null) {
							this.setQuestion(0);
						}
						//clear the question to edit ...
						this.dataService.setQuestionToEdit(new Question(''));
					},
					() => {
						//TODO: handle question retrieval error
					}
				);
			}
		}
	}
}

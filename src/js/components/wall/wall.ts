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
		static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', 'URLService', '$window', 'UtilityService'];
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

        constructor(
			private dataService: DataService,
			private $mdSidenav: ISidenavService,
			private $mdBottomSheet: IBottomSheetService,
			private urlService: IURLService,
			private $window: IWindowService,
			private utilityService: UtilityService) {
			console.log('--> WallController: started: ');

            this.unselected_users = [];
	        this.unselected_tags = [];
	        this.dataService.checkAuthentication((success) => {
				this.activate();
			}, null);
		}


		activate(): void {
			if (this.dataService.getWall() === null) {
				this.$window.location.href = this.urlService.getHost() + '/#/';
			} else {
				var question_index = this.dataService.getWall().questions.length > 0 ? 0 : -1;
				this.setQuestion(question_index);
				if (this.dataService.userIsAuthorised()) {
	                this.rightMenu3 = true;
	                this.$mdSidenav('right').open();
				}
				this.selectedContributor = this.dataService.getNickname();

				if (this.dataService.userIsAuthorised() &&
					this.dataService.getAuthenticatedUser().defaultEmail !== undefined &&
					this.dataService.getAuthenticatedUser().defaultEmail !== '') {
					this.owneremail = this.dataService.getAuthenticatedUser().defaultEmail;
				}

				var handle = this;
				//contributor filtering (for messages on the board)
				this.messageFilterByContributorOnBoard = function(message: Message) {
					if (!message.deleted &&
						!handle.dataService.getPhoneMode() &&
						message.board !== undefined &&
						message.board[handle.selectedContributor] !== undefined &&
						handle.unselected_users.indexOf(message.creator) === -1 &&
						handle.messageTagsNotPresent(message)) {
						return true;
					} else {
						return false;
					}
				};

				//author+tag filtering (for messages in the feed)
				this.messageFilterByAuthorAndTag = function(message: Message) {
					if (!message.deleted && handle.unselected_users.indexOf(message.creator) === -1 && handle.messageTagsNotPresent(message)) {
						return true;
					} else {
						return false;
					}
				};

			}
		}

		messageTagsNotPresent(message): boolean {
			var messageTags = this.utilityService.getPossibleTags(message.text);
			if (messageTags !== null) {
				var present: boolean = false;
				for (var i = 0; i < messageTags.length; i++) {
					if (this.unselected_tags.indexOf(messageTags[i]) === -1) {
						present = true;
					}
				}

				return present;

			} else {
				return true;
			}
		}

		showFeed(): void {
			this.feedView = true;
			this.selectedContributor = this.dataService.getNickname();
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
                    if ( this.dataService.getCurrentQuestionIndex() !== -1 ) {
                        this.savedGridType = this.dataService.getQuestion().grid;
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
            this.dataService.getQuestionToEdit().grid = type;
        }

        questionToEditDirty() {
	        if (this.dataService.getQuestionToEdit() === null || this.dataService.getQuestion() === null) {
		        return true;
	        } else {
	            return (this.dataService.getQuestionToEdit().label !== this.dataService.getQuestion().label
	                && this.dataService.getQuestionToEdit().label !== '')
	                || typeof this.dataService.getQuestionToEdit()._id !== 'undefined';
	        }
        }

        /**** author filtering ******/
        userExists(item) {
            return this.unselected_users.indexOf(item) === -1;
        };

		userToggle(item) {
            var idx = this.unselected_users.indexOf(item);
            if (idx > -1) {
                this.unselected_users.splice(idx, 1);
            } else {
                this.unselected_users.push(item);
            }
        };

        userIsChecked() {
            return this.unselected_users.length !== this.dataService.getContributors().length;
        };

        toggleAll() {
            if (this.unselected_users.length === this.dataService.getContributors().length) {
                this.unselected_users = [];
            } else {
                this.unselected_users = this.dataService.getContributors().slice(0);
            }
        };
		/**** author filtering ******/


		/**** tag filtering ******/
		tagExists(item) {
			return this.unselected_tags.indexOf(item) === -1;
		};

		tagToggle(item) {
			var idx = this.unselected_tags.indexOf(item);
			if (idx > -1) {
				this.unselected_tags.splice(idx, 1);
			} else {
				this.unselected_tags.push(item);
			}
		};

		tagIsChecked() {
			return this.unselected_tags.length !== this.dataService.getTags().length;
		};

		toggleAllTags() {
			if (this.unselected_tags.length === this.dataService.getTags().length) {
				this.unselected_tags = [];
			} else {
				this.unselected_tags = this.dataService.getTags().slice(0);
			}
		};
		/**** tag filtering ******/

		showMessageEditor(newMessage: boolean): void {
			var handle = this;
			if (newMessage) {
                handle.dataService.setMessageToEdit(null);
			}
            this.dataService.stopPolling();
            this.showFeed();
			this.$mdBottomSheet.show({
				controller: EditMessageController,
				controllerAs: 'editMessageC',
				templateUrl: 'js/components/editMessagePanel/editMessagePanel.html'
			}).then(function(answer) {
				//dialog answered
				console.log('--> WallController: answer: ' + answer);
				//post message to server and add returned object to question feed
                if (handle.dataService.getMessageToEdit()._id === undefined) {
                    handle.dataService.addMessage(
                        function () {
                            //success
                        },
                        function (error: {}) {
                            //TODO: handle message create error
                        }
                    );
                } else {
                    handle.dataService.updateMessage();
                }
                handle.dataService.startPolling('none', 'none');
			}, function() {
				//dialog dismissed
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
					(success) => {
						//set to the new question if none
						if (this.dataService.getQuestion() === null) {
							this.setQuestion(0);
						}
						//clear the question to edit ...
						this.dataService.setQuestionToEdit(new Question(''));
					},
					function(error) {
						//TODO: handle question retrieval error
					}
				);
			} else {
				this.dataService.addQuestion(
					(success) => {
						//set to the new question if none
						if (this.dataService.getQuestion() === null) {
							this.setQuestion(0);
						}
						//clear the question to edit ...
						this.dataService.setQuestionToEdit(new Question(''));
					},
					function(error) {
						//TODO: handle question retrieval error
					}
				);
			}
		}
	}
}

/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>
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
	}

	export class WallController implements IWallControllerService {
		static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', 'URLService', '$window'];
		private magnified: boolean = false;
		private feedView: boolean = true;
		private rightMenu1: boolean = false;
		private rightMenu2: boolean = false;
		private rightMenu3: boolean = false;
        private rightMenu4: boolean = false;
		private owneremail: string;

        private savedGridType: string = 'none';
		private backgroundColour: string = '';
        private selected_users: Array<string>;

        public messageFilterBySelectedUsers: (Message) => boolean;
        private userFilterOn: boolean = false;

        constructor(
			private dataService: DataService,
			private $mdSidenav: ISidenavService,
			private $mdBottomSheet: IBottomSheetService,
			private urlService: IURLService,
			private $window: IWindowService) {
			console.log('--> WallController: started: ');

            var self = this;
            this.selected_users = [];
			this.dataService.checkAuthentication((success) => {
				this.activate();
			}, null);

            this.messageFilterBySelectedUsers = function(message: Message) {
                if (self.userFilterOn) {
                    return self.selected_users.indexOf(message.creator) > -1;
                } else {
                    return true;
                }
            };
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
			}
		}

        setQuestion(index) {
	        this.dataService.setQuestion(index,
		        () => {
                    if ( this.dataService.getCurrentQuestionIndex() !== -1 ) {
                        this.savedGridType = this.dataService.getQuestion().grid;
                        this.backgroundColour = this.dataService.getBackgroundColour();
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

        // Functions for connected users panel
        userExists(item) {
            return this.selected_users.indexOf(item) > -1;
        };
        userToggle(item) {
            var idx = this.selected_users.indexOf(item);
            if (idx > -1) {
                this.selected_users.splice(idx, 1);
            } else {
                this.selected_users.push(item);
            }
        };
        userIsChecked() {
            return this.selected_users.length === this.dataService.getParticipants().length;
        };
        toggleAll() {
            if (this.selected_users.length === this.dataService.getParticipants().length) {
                this.selected_users = [];
            } else if (this.selected_users.length === 0 || this.selected_users.length > 0) {
                this.selected_users = this.dataService.getParticipants().slice(0);
            }
        };

		showMessageEditor(newMessage: boolean): void {
			var handle = this;
			if (newMessage) {
                handle.dataService.setMessageToEdit(null);
			}
            this.dataService.stopPolling();
            this.$mdSidenav('left').open();
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
                    this.selected_users = this.dataService.getParticipants().slice(0);
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

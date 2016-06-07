/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../editMessagePanel/editMessagePanel.ts"/>

module TalkwallApp {
	"use strict";
	import IBottomSheetService = angular.material.IBottomSheetService;
	import ISidenavService = angular.material.ISidenavService;

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
		postNewQuestion(): void;
        /**
         * Get question at index
         * @param index wall.questions Index of the question being selected
         */
        setQuestion(index: number): void;
	}

	export class WallController implements IWallControllerService {
		static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet'];
		private magnified: boolean = false;
		private feedView: boolean = true;
		private rightMenu1: boolean = false;
		private rightMenu2: boolean = false;
		private rightMenu3: boolean = false;
		private newQuestionLabel: string = '';

        private currentWall: Wall;
        private currentQuestion: Question;
        private currentQuestionIndex: number = 0;

		constructor(
			private dataService: DataService,
			private $mdSidenav: ISidenavService,
			private $mdBottomSheet: IBottomSheetService) {
			console.log('--> WallController: started: ');

			this.dataService.checkAuthentication((success) => {
				this.activate();
			}, null);
		}

		activate(): void {
            this.currentWall = this.dataService.getWall();
            if (this.currentWall.questions.length > 0) {
                this.setQuestion(0);    // Select first question, no previous question
            }
			if (this.dataService.userIsAuthorised()) {
                this.rightMenu2 = true;
                this.$mdSidenav('right').open();
			}
		}

        setQuestion(questionIndex: number) {
			this.currentQuestion = this.currentWall.questions[questionIndex];
		}

		showMessageEditor(newMessage): void {
			var handle = this;
			if (newMessage) {
				this.dataService.messageToEdit = new Message();
			}
			this.$mdSidenav('left').open();
			this.$mdBottomSheet.show({
				controller: EditMessageController,
				controllerAs: 'editMessageC',
				templateUrl: 'js/components/editMessagePanel/editMessagePanel.html'
			}).then(function(answer) {
				//dialog answered
				console.log('--> WallController: answer: ' + answer);
				//post message to server and add returned object to question feed
				handle.dataService.sendMessage(
					function() {
						//success
						handle.dataService.messageToEdit = null;
					},
					function(error: {}) {
						//TODO: handle message POST error
					}
				);
			}, function() {
				//dialog dismissed
				console.log('--> WallController: dismissed');
			});
		}

		toggleRightMenu(n: number): void {
			console.log('--> WallController: toggleRightMenu: ' + n);
			switch (n) {
				case 1:
					this.rightMenu1 = !this.rightMenu1;
					this.rightMenu2 = false;
					this.rightMenu3 = false;
					break;
				case 2:
					this.rightMenu1 = false;
					this.rightMenu2 = !this.rightMenu2;
					this.rightMenu3 = false;
					break;
				case 3:
					this.rightMenu1 = false;
					this.rightMenu2 = false;
					this.rightMenu3 = !this.rightMenu3;
					break;
				default:
					this.rightMenu1 = false;
					this.rightMenu2 = false;
					this.rightMenu3 = false;
			}
		}

		postNewQuestion(): void {
			this.dataService.addQuestion(this.newQuestionLabel,
				(success) => {
					this.newQuestionLabel = '';
				},
				function(error) {
					//TODO: handle question retrieval error
				}
			);
		}
	}
}

/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../editMessage/editMessage.ts"/>

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
		showMessageEditor(): void;
		/**
		 * Toggles which right menu should be open
		 */
		toggleRightMenu(index: number): void;
		/**
		 * Post a new question
		 */
		postNewQuestion(): void;
	}

	export class WallController implements IWallControllerService {
		static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet'];
		private magnified: boolean = false;
		private feedView: boolean = true;
		private rightMenu1: boolean = false;
		private rightMenu2: boolean = false;
		private rightMenu3: boolean = false;
		private question: Question = null;
		private currentQuestionIndex: number = 0;
		private newQuestion: string = '';
		constructor(
			private dataService: DataService,
			private $mdSidenav: ISidenavService,
			private $mdBottomSheet: IBottomSheetService) {
			console.log('--> WallController: started: ');

			var handle = this;
			this.dataService.checkAuthenticated(function() {
				handle.activate();
			});
		}

		activate(): void {
			console.log('--> WallController: activated');
			//retrieve the first question of the current wall
			if (this.dataService.getWall().questions.length > 0 && this.dataService.getWall().questions.length >= this.currentQuestionIndex) {
				this.refreshQuestion();
			} else {
				this.rightMenu2 = true;
				this.$mdSidenav('right').open();
			}
		}

		refreshQuestion(): void {
			var handle = this;
			let idKey = '_id';
			this.dataService.getQuestion(this.dataService.getWall().questions[this.currentQuestionIndex][idKey],
				function(success: Question) {
					handle.question = success;
				},
				function(error: {}) {
					//TODO: handle question retrieval error
				});
		}

		showMessageEditor(): void {
			var handle = this;
			this.dataService.messageToEdit = new Message();
			this.$mdSidenav('left').open();
			this.$mdBottomSheet.show({
				controller: EditMessageController,
				controllerAs: 'editMessageC',
				templateUrl: 'js/components/editMessage/editMessage.html'
			}).then(function(answer) {
				//dialog answered
				console.log('--> WallController: answer: ' + answer);
				//post message to server and add returned object to question feed
				handle.dataService.postMessage(handle.question._id, answer,
				function(message: Message) {
					handle.question.messageFeed.push(message);
				},
				function(error: {}) {
					//TODO: handle message POST error
				});
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
			var handle = this;
			this.dataService.addQuestion(this.newQuestion,
				function() {
					//success
					handle.newQuestion = '';
					handle.refreshQuestion();
				},
				function(error: {}) {
					//TODO: handle question retrieval error
				}
			);
		}
	}
}

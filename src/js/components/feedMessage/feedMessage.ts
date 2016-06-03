/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	class FeedMessageController {
		static $inject = ['$scope', 'DataService'];

		private message: Message;
		private showControls: boolean = false;
		private isSelected: boolean = false;

		constructor(
			private isolatedScope: FeedMessageDirectiveScope,
			private dataService: DataService) {
			this.message = isolatedScope.message;
		};

		/**
		 * init
		 */
		activate(): void {
			console.log('--> FeedMessageController activated');
			if (this.message.board[this.dataService.getNickname()] !== undefined) {
				this.isSelected = true;
			}
		}

		deleteMessage(): void {
			var handle = this;
			this.message.deleted = true;
			this.dataService.messageToEdit = this.message;
			this.dataService.deleteMessage(
				function() {
					//success delete
					handle.dataService.messageToEdit = null;
				},
				function(error: {}) {
					//TODO: handle message delete error
				}
			);
		}

		editMessage(): void {
			this.dataService.messageToEdit = this.message;
			this.isolatedScope.showEditPanel();
		}

		selectMessage(): void {
			var handle = this;
			this.message.board[this.dataService.getNickname()] = {
				xpos: 500,
				ypos: 500
			};
			this.dataService.messageToEdit = this.message;
			this.dataService.sendMessage(
				function() {
					handle.isSelected = true;
					handle.dataService.messageToEdit = null;
				},
				function(error: {}) {
					//TODO: handle message POST error
				}
			);
		}

		unselectMessage(): void {
			var handle = this;
			delete this.message.board[this.dataService.getNickname()];
			this.dataService.messageToEdit = this.message;
			this.dataService.sendMessage(
				function() {
					handle.isSelected = false;
					handle.dataService.messageToEdit = null;
				},
				function(error: {}) {
					//TODO: handle message POST error
				});
		}
	}

	//isolated scope interface
	export interface FeedMessageDirectiveScope {
		message: Message;
		showEditPanel(): void;
	}

	//directive declaration
	export function FeedMessage(): ng.IDirective {
		return {
			restrict: 'A',
			scope: {
				message: '=',
				showEditPanel: "&"
			},
			templateUrl: 'js/components/feedMessage/feedMessage.html',
			controller: FeedMessageController,
			controllerAs: 'feedMessageC',
			replace: true
		};
	}
}

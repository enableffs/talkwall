/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../../services/utilityservice.ts"/>

module TalkwallApp {
	"use strict";
	import ITimeoutService = angular.ITimeoutService;
	class FeedMessageController {
		static $inject = ['$scope', 'DataService', '$document', 'UtilityService'];

		private message: Message;
		private showControls: boolean = false;

		constructor(
			private isolatedScope: FeedMessageDirectiveScope,
			public dataService: DataService,
			public $document: ng.IDocumentService,
			private utilityService: UtilityService) {
			this.message = isolatedScope.data;
		};

		/**
		 * init
		 */
		activate(): void {
			console.log('--> FeedMessageController activated');
			if (this.message.board[this.dataService.getNickname()] !== undefined) {
				this.message.isSelected = true;
			} else {
				this.message.isSelected = false;
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
				xpos: handle.utilityService.getRandomBetween(45, 55) / 100,
				ypos: handle.utilityService.getRandomBetween(45, 55) / 100
			};
			this.dataService.messageToEdit = this.message;
			this.dataService.sendMessage(
				function() {
					handle.message.isSelected = true;
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
					handle.message.isSelected = false;
					handle.dataService.messageToEdit = null;
				},
				function(error: {}) {
					//TODO: handle message POST error
				});
		}
	}

	function linker(isolatedScope: FeedMessageDirectiveScope , element: ng.IAugmentedJQuery,
	                attributes: ng.IAttributes, ctrl: FeedMessageController) {
		let viewWidthKey = 'VIEW_WIDTH', viewHeightKey = 'VIEW_HEIGHT';

		if (isolatedScope.onBoard === 'true') {
			var messageWidth = element.prop('offsetWidth');
			var messageHeight = element.prop('offsetHeight');
			var currentSize = ctrl.dataService.getBoardDivSize();
			var startX = 0, startY = 0;

			element.css({
				top: isolatedScope.data.board[ctrl.dataService.getNickname()].ypos * 100 + '%',
				left: isolatedScope.data.board[ctrl.dataService.getNickname()].xpos * 100 + '%'
			});

			element.on('mousedown', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();

				// Calculate limits based on current bounding box size
				currentSize = ctrl.dataService.getBoardDivSize();
				messageWidth = element.prop('offsetWidth');
				messageHeight = element.prop('offsetHeight');
				startX = event.screenX - (isolatedScope.data.board[ctrl.dataService.getNickname()].xpos * currentSize[viewWidthKey]);
				startY = event.screenY - (isolatedScope.data.board[ctrl.dataService.getNickname()].ypos * currentSize[viewHeightKey]);
				ctrl.$document.on('mousemove', mousemove);
				ctrl.$document.on('mouseup', mouseup);
			});
		}

		function mousemove(event) {
			isolatedScope.data.board[ctrl.dataService.getNickname()].xpos = event.screenX - startX;
			isolatedScope.data.board[ctrl.dataService.getNickname()].ypos = event.screenY - startY;

			if (isolatedScope.data.board[ctrl.dataService.getNickname()].xpos < 0) {
				isolatedScope.data.board[ctrl.dataService.getNickname()].xpos = 0;
			}

			if (isolatedScope.data.board[ctrl.dataService.getNickname()].xpos > (currentSize[viewWidthKey] - messageWidth)) {
				isolatedScope.data.board[ctrl.dataService.getNickname()].xpos = (currentSize[viewWidthKey] - messageWidth);
			}

			if (isolatedScope.data.board[ctrl.dataService.getNickname()].ypos < 0) {
				isolatedScope.data.board[ctrl.dataService.getNickname()].ypos = 0;
			}

			if (isolatedScope.data.board[ctrl.dataService.getNickname()].ypos > (currentSize[viewHeightKey] - messageHeight)) {
				isolatedScope.data.board[ctrl.dataService.getNickname()].ypos = (currentSize[viewHeightKey] - messageHeight);
			}

			element.css({
				top: isolatedScope.data.board[ctrl.dataService.getNickname()].ypos + 'px',
				left: isolatedScope.data.board[ctrl.dataService.getNickname()].xpos + 'px'
			});
		}

		function mouseup() {
			ctrl.$document.off('mousemove', mousemove);
			ctrl.$document.off('mouseup', mouseup);
			isolatedScope.data.board[ctrl.dataService.getNickname()].xpos =
				isolatedScope.data.board[ctrl.dataService.getNickname()].xpos / currentSize[viewWidthKey];
			isolatedScope.data.board[ctrl.dataService.getNickname()].ypos =
				isolatedScope.data.board[ctrl.dataService.getNickname()].ypos / currentSize[viewHeightKey];
		}

	}

	//isolated scope interface
	export interface FeedMessageDirectiveScope extends ng.IScope {
		data: Message;
		showEditPanel(): void;
		onBoard: string;
	}

	//directive declaration
	export function FeedMessage(): ng.IDirective {
		return {
			restrict: 'A',
			scope: {
				data: '=',
				showEditPanel: "&",
				onBoard: "@"
			},
			templateUrl: 'js/components/feedMessage/feedMessage.html',
			controller: FeedMessageController,
			controllerAs: 'feedMessageC',
			link: linker,
			replace: true
		};
	}
}

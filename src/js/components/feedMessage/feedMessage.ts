/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../../services/utilityservice.ts"/>

module TalkwallApp {
	"use strict";
	import ITimeoutService = angular.ITimeoutService;
	class FeedMessageController {
		static $inject = ['$scope', 'DataService', '$document', 'UtilityService', '$timeout'];

		private message: Message;
		public showControls: boolean = false;
		private originReversed: Array<{}> = new Array();

		constructor(
			private isolatedScope: FeedMessageDirectiveScope,
			public dataService: DataService,
			public $document: ng.IDocumentService,
			private utilityService: UtilityService,
			public $timeout: ITimeoutService) {
			this.message = isolatedScope.data;
			this.originReversed = this.message.origin.reverse();
			if (this.message.board === undefined) {
				this.message.board = {};
			}
			this.message.isPinned = false;
			if (this.message.board[this.dataService.getNickname()] !== undefined) {
				this.message.isSelected = true;
				if (this.message.board[this.dataService.getNickname()].pinned === true) {
					this.message.isPinned = false;
				}
			} else {
				this.message.isSelected = false;
			}
		};

		deleteMessage(): void {
            this.dataService.setMessageToEdit(this.message);
            this.message.deleted = true;
			this.dataService.updateMessage(
				function() {
					//success delete
				},
				function(error: {}) {
					//TODO: handle message delete error
				}
			);
		}

		editMessage(): void {
			this.dataService.setMessageToEdit(this.message);
			this.isolatedScope.showEditPanel();
		}

		selectMessage(): void {
			var handle = this;
			this.message.board[this.dataService.getNickname()] = {
				xpos: handle.utilityService.getRandomBetween(45, 55) / 100,
				ypos: handle.utilityService.getRandomBetween(45, 55) / 100,
				pinned: false
			};
			this.dataService.setMessageToEdit(this.message);
			this.dataService.updateMessage(
				function() {
					handle.message.isSelected = true;
					handle.dataService.setMessageToEdit(null);
				},
				function(error: {}) {
					//TODO: handle message POST error
				}
			);
		}

		unselectMessage(): void {
			var handle = this;
			delete this.message.board[this.dataService.getNickname()];
			this.message.isPinned = false;
			this.dataService.setMessageToEdit(this.message);
			this.dataService.updateMessage(
				function() {
					handle.message.isSelected = false;
					handle.dataService.setMessageToEdit(null);
				},
				function(error: {}) {
					//TODO: handle message POST error
				});
		}

		pinMessage(): void {
			var handle = this;
			this.message.board[this.dataService.getNickname()].pinned = true;
			this.dataService.setMessageToEdit(this.message);
			this.dataService.updateMessage(
				function() {
					handle.message.isPinned = true;
					handle.dataService.setMessageToEdit(null);
				},
				function(error: {}) {
					//TODO: handle message POST error
				}
			);
		}

		unpinMessage(): void {
			var handle = this;
			this.message.board[this.dataService.getNickname()].pinned = false;
			this.dataService.setMessageToEdit(this.message);
			this.dataService.updateMessage(
				function() {
					handle.message.isPinned = false;
					handle.dataService.setMessageToEdit(null);
				},
				function(error: {}) {
					//TODO: handle message POST error
				}
			);
		}
	}

	function linker(isolatedScope: FeedMessageDirectiveScope , element: ng.IAugmentedJQuery,
	                attributes: ng.IAttributes, ctrl: FeedMessageController) {
		let viewWidthKey = 'VIEW_WIDTH', viewHeightKey = 'VIEW_HEIGHT';
		let changedTouchesKey = 'changedTouches';
		var startX = 0, startY = 0;

		if (isolatedScope.onBoard === 'true') {
			var messageWidth = element.prop('offsetWidth');
			var messageHeight = element.prop('offsetHeight');
			var currentSize = ctrl.dataService.getBoardDivSize();

			element.css({
				top: isolatedScope.data.board[ctrl.dataService.getNickname()].ypos * 100 + '%',
				left: isolatedScope.data.board[ctrl.dataService.getNickname()].xpos * 100 + '%'
			});

			element.on('mousedown touchstart', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();
				currentSize = ctrl.dataService.getBoardDivSize();
				messageWidth = element.prop('offsetWidth');
				messageHeight = element.prop('offsetHeight');

				if (event instanceof TouchEvent) {
					// Handling the touchstart event
					var touchobj = event[changedTouchesKey][0];
					startX = touchobj.clientX;
					startY = touchobj.clientY;
					ctrl.$document.on('touchmove', touchmove);
					ctrl.$document.on('touchend', touchend);
				} else if (event instanceof MouseEvent) {
					// Handling the mousedown event
					startX = event.screenX - (isolatedScope.data.board[ctrl.dataService.getNickname()].xpos * currentSize[viewWidthKey]);
					startY = event.screenY - (isolatedScope.data.board[ctrl.dataService.getNickname()].ypos * currentSize[viewHeightKey]);
					ctrl.$document.on('mousemove', mousemove);
					ctrl.$document.on('mouseup', mouseup);
				}
			});
		}

		function mousemove(event) {
			isolatedScope.data.board[ctrl.dataService.getNickname()].xpos = event.screenX - startX;
			isolatedScope.data.board[ctrl.dataService.getNickname()].ypos = event.screenY - startY;
			doMove();
		}

		function touchmove(event) {
			var touchobj = event[changedTouchesKey][0];
			isolatedScope.data.board[ctrl.dataService.getNickname()].xpos = touchobj.pageX - startX;
			isolatedScope.data.board[ctrl.dataService.getNickname()].ypos = touchobj.pageY - startY;
			doMove();
		}

		function doMove() {
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

			isolatedScope.data.board[ctrl.dataService.getNickname()].xpos =
				isolatedScope.data.board[ctrl.dataService.getNickname()].xpos / currentSize[viewWidthKey];
			isolatedScope.data.board[ctrl.dataService.getNickname()].ypos =
				isolatedScope.data.board[ctrl.dataService.getNickname()].ypos / currentSize[viewHeightKey];
		}

		function mouseup() {
			ctrl.$document.off('mousemove', mousemove);
			ctrl.$document.off('mouseup', mouseup);
		}

		function touchend() {
			ctrl.$document.off('touchmove', touchmove);
			ctrl.$document.off('touchend', touchend);
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

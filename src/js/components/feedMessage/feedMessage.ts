/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../../services/utilityservice.ts"/>

module TalkwallApp {
	"use strict";

    export interface IFeedMessageController {
        deleteMessage(): void;
        editMessage(): void;
        toggleSelectMessage(): void;
        togglePinMessage(): void;
	    isSelected(): boolean;
    }

	class FeedMessageController implements IFeedMessageController {
		static $inject = ['$scope', 'DataService', '$document', 'UtilityService', '$window'];

		private message: Message;
		private showControls: boolean = false;

		constructor(
			private isolatedScope: FeedMessageDirectiveScope,
			public dataService: DataService,
			public $document: ng.IDocumentService,
			private utilityService: UtilityService,
			public $window: ng.IWindowService) {

            this.message = isolatedScope.data;

            if (typeof this.message.origin !== 'undefined') {
                if (this.message.board === undefined) {
                    this.message.board = {};
                }
                this.message.isPinned = false;
                if (this.isSelected() && this.message.board[this.isolatedScope.selectedContributor].pinned === true) {
                    this.message.isPinned = true;
                }
            }
		};

		isSelected(): boolean {
			if (this.message.board !== undefined && this.message.board[this.isolatedScope.selectedContributor] !== undefined) {
				return true;
			} else {
				return false;
			}
		}

		deleteMessage(): void {
			//check if authenticated or author
			if (this.message.creator === this.dataService.getNickname() || this.dataService.userIsAuthorised()) {
				this.message.deleted = true;
				this.persistMessage();
			}
		}

		editMessage(): void {
			if (this.message.creator === this.dataService.getNickname()) {
				this.dataService.setMessageToEdit(this.message);
				this.isolatedScope.showEditPanel();
				this.showControls = false;
			} else {
				this.dataService.setMessageOrigin(this.message);
				this.dataService.setMessageToEdit(null);
				this.isolatedScope.showEditPanel();
				this.showControls = false;
			}
		}

		toggleSelectMessage(): void {
			if (this.isSelected()) {
                delete this.message.board[this.dataService.getNickname()];
            } else {
                this.message.board[this.dataService.getNickname()] = {
                    xpos: this.utilityService.getRandomBetween(45, 55) / 100,
                    ypos: this.utilityService.getRandomBetween(45, 55) / 100,
                    pinned: false
                };
            }
			this.persistMessage();
		}

		togglePinMessage(): void {
			var handle = this;
			this.message.board[this.dataService.getNickname()].pinned
                = !this.message.board[this.dataService.getNickname()].pinned;
			this.persistMessage();
		}

		persistMessage(): void {
			this.dataService.setMessageToEdit(this.message);
			this.dataService.updateMessage();
		}

		getSelectedClass(): string {
			if (this.isSelected() && this.isolatedScope.onBoard === 'false') {
				return 'feedMessage-messageSelected';
			} else if (this.message.isPinned && this.isolatedScope.onBoard === 'true') {
				return 'feedMessage-messageSelected';
			} else {
				return 'feedMessage-messageNotSelected';
			}
		}
	}

	function linker(isolatedScope: FeedMessageDirectiveScope , element: ng.IAugmentedJQuery,
	                attributes: ng.IAttributes, ctrl: FeedMessageController) {
		let viewWidthKey = 'VIEW_WIDTH', viewHeightKey = 'VIEW_HEIGHT';
		let changedTouchesKey = 'changedTouches', touchEventKey = 'TouchEvent';
		var startX = 0, startY = 0;
		var absStartX = 0, absStartY = 0;
		var diffX = 0, diffY = 0;
		var persistPosition: boolean = false;

		var messageWidth = element.prop('offsetWidth');
		var messageHeight = element.prop('offsetHeight');
		var currentSize = ctrl.dataService.getBoardDivSize();

		if (isolatedScope.onBoard === 'true') {
			positionMessage();

			//need a watch here, to refresh the position when the selected contributor changes
			isolatedScope.$watch('selectedContributor', positionMessage);
		}

		function positionMessage() {
			element.css({
				top: isolatedScope.data.board[isolatedScope.selectedContributor].ypos * 100 + '%',
				left: isolatedScope.data.board[isolatedScope.selectedContributor].xpos * 100 + '%'
			});

			element.on('mousedown touchstart', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();
				currentSize = ctrl.dataService.getBoardDivSize();
				messageWidth = element.prop('offsetWidth');
				messageHeight = element.prop('offsetHeight');

				if (event instanceof MouseEvent) {
					// Handling the mousedown event
					absStartX = event.screenX;
					absStartY = event.screenY;
					startX = absStartX - (isolatedScope.data.board[isolatedScope.selectedContributor].xpos * currentSize[viewWidthKey]);
					startY = absStartY - (isolatedScope.data.board[isolatedScope.selectedContributor].ypos * currentSize[viewHeightKey]);
					ctrl.$document.on('mousemove', mousemove);
					ctrl.$document.on('mouseup', mouseup);
				} else if (event instanceof TouchEvent) {
					// Handling the touchstart event
					var touchobj = event[changedTouchesKey][0];
					startX = touchobj.clientX;
					startY = touchobj.clientY;
					absStartX = touchobj.pageX;
					absStartY = touchobj.pageY;
					ctrl.$document.on('touchmove', touchmove);
					ctrl.$document.on('touchend', touchend);
				}
				ctrl.dataService.stopPolling();
			});
		}

		function mousemove(event) {
			diffX = event.screenX - absStartX;
			diffY = event.screenY - absStartY;
			//will only persist if move greater than a 5*5px box
			if (diffX >= 5 || diffX <= -5 || diffY >= 5 || diffY <= -5) {
				persistPosition = true;
			}
			isolatedScope.data.board[isolatedScope.selectedContributor].xpos = event.screenX - startX;
			isolatedScope.data.board[isolatedScope.selectedContributor].ypos = event.screenY - startY;
			doMove();
		}

		function touchmove(event) {
			var touchobj = event[changedTouchesKey][0];
			diffX = touchobj.pageX - absStartX;
			diffY = touchobj.pageY - absStartY;
			//will only persist if move greater than a 5*5px box
			if (diffX >= 5 || diffX <= -5 || diffY >= 5 || diffY <= -5) {
				persistPosition = true;
			}
			isolatedScope.data.board[isolatedScope.selectedContributor].xpos = touchobj.pageX - startX;
			isolatedScope.data.board[isolatedScope.selectedContributor].ypos = touchobj.pageY - startY;
			doMove();
		}

		function doMove() {
			if (isolatedScope.data.board[isolatedScope.selectedContributor].xpos < 0) {
				isolatedScope.data.board[isolatedScope.selectedContributor].xpos = 0;
			}

			if (isolatedScope.data.board[isolatedScope.selectedContributor].xpos > (currentSize[viewWidthKey] - messageWidth)) {
				isolatedScope.data.board[isolatedScope.selectedContributor].xpos = (currentSize[viewWidthKey] - messageWidth);
			}

			if (isolatedScope.data.board[isolatedScope.selectedContributor].ypos < 0) {
				isolatedScope.data.board[isolatedScope.selectedContributor].ypos = 0;
			}

			if (isolatedScope.data.board[isolatedScope.selectedContributor].ypos > (currentSize[viewHeightKey] - messageHeight)) {
				isolatedScope.data.board[isolatedScope.selectedContributor].ypos = (currentSize[viewHeightKey] - messageHeight);
			}

			element.css({
				top: isolatedScope.data.board[isolatedScope.selectedContributor].ypos + 'px',
				left: isolatedScope.data.board[isolatedScope.selectedContributor].xpos + 'px'
			});

			isolatedScope.data.board[isolatedScope.selectedContributor].xpos =
				isolatedScope.data.board[isolatedScope.selectedContributor].xpos / currentSize[viewWidthKey];
			isolatedScope.data.board[isolatedScope.selectedContributor].ypos =
				isolatedScope.data.board[isolatedScope.selectedContributor].ypos / currentSize[viewHeightKey];
		}

		function mouseup() {
			ctrl.$document.off('mousemove', mousemove);
			ctrl.$document.off('mouseup', mouseup);
			//only persist if significant move (> 10px)
			//helps not persisting when clicking on controls only
			if (persistPosition && isolatedScope.selectedContributor === ctrl.dataService.getNickname()) {
				ctrl.persistMessage();
			}
            ctrl.dataService.startPolling('none', 'none');
		}

		function touchend() {
			ctrl.$document.off('touchmove', touchmove);
			ctrl.$document.off('touchend', touchend);
			//only persist if significant move (> 10px)
			//helps not persisting when clicking on controls only
			if (persistPosition && isolatedScope.selectedContributor === ctrl.dataService.getNickname()) {
				ctrl.persistMessage();
			}
            ctrl.dataService.startPolling('none', 'none');
		}
	}

	//isolated scope interface
	export interface FeedMessageDirectiveScope extends ng.IScope {
		data: Message;
		showEditPanel(): void;
		onBoard: string;
		selectedContributor: string;
	}

	//directive declaration
	export function FeedMessage(): ng.IDirective {
		return {
			restrict: 'A',
			scope: {
				data: '=',
				showEditPanel: "&",
				onBoard: "@",
				selectedContributor: '@'
			},
			templateUrl: 'js/components/feedMessage/feedMessage.html',
			controller: FeedMessageController,
			controllerAs: 'feedMessageC',
			link: linker,
			replace: true
		};
	}
}

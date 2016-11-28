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
				this.message.isPinned = (this.isSelected() && this.message.board[this.isolatedScope.selectedContributor].pinned === true);
            }
		};

		isSelected(): boolean {
			return (this.message.board !== undefined && this.message.board[this.isolatedScope.selectedContributor] !== undefined);
		}

		deleteMessage(): void {
			//check if authenticated or author
			if (this.message.creator === this.dataService.data.status.nickname || this.dataService.data.status.authorised) {
				this.message.deleted = true;
				this.persistMessage();
			}
		}

		editMessage(): void {
			if (this.message.creator === this.dataService.data.status.nickname) {
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
                delete this.message.board[this.dataService.data.status.nickname];
            } else {
                this.message.board[this.dataService.data.status.nickname] = {
                    xpos: this.utilityService.getRandomBetween(45, 55) / 100,
                    ypos: this.utilityService.getRandomBetween(45, 55) / 100,
                    pinned: false
                };
            }
			this.persistMessage();
		}

		togglePinMessage(): void {
			this.message.board[this.dataService.data.status.nickname].pinned
                = !this.message.board[this.dataService.data.status.nickname].pinned;
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
		let changedTouchesKey = 'changedTouches'; // touchEventKey = 'TouchEvent';
		let startX = 0, startY = 0;
		let absStartX = 0, absStartY = 0;
		let diffX = 0, diffY = 0;
		let newX = 0, newY = 0;
		let persistPosition: boolean = false;

		let messageWidth = element.prop('offsetWidth');
		let messageHeight = element.prop('offsetHeight');
		let currentSize = ctrl.dataService.data.status.boardDivSize;

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
				currentSize = ctrl.dataService.data.status.boardDivSize;
				messageWidth = element.prop('offsetWidth');
				messageHeight = element.prop('offsetHeight');
				persistPosition = false;

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
					let touchobj = event[changedTouchesKey][0];
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
			let touchobj = event[changedTouchesKey][0];
			diffX = touchobj.pageX - absStartX;
			diffY = touchobj.pageY - absStartY;
			newX = touchobj.pageX - startX;
			newY = touchobj.pageY - startY;
			//will only persist if move greater than a 5*5px box
			if ((diffX >= 5 || diffX <= -5 || diffY >= 5 || diffY <= -5) && (newX >= 0 && newY >= 0))  {
				persistPosition = true;
			}
			isolatedScope.data.board[isolatedScope.selectedContributor].xpos = newX;
			isolatedScope.data.board[isolatedScope.selectedContributor].ypos = newY;
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
			if (persistPosition && isolatedScope.selectedContributor === ctrl.dataService.data.status.nickname) {
				ctrl.persistMessage();
			}
            ctrl.dataService.startPolling('none', 'none');
		}

		function touchend() {
			ctrl.$document.off('touchmove', touchmove);
			ctrl.$document.off('touchend', touchend);
			//only persist if significant move (> 10px)
			//helps not persisting when clicking on controls only
			if (persistPosition && isolatedScope.selectedContributor === ctrl.dataService.data.status.nickname) {
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

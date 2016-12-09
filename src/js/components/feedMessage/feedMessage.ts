/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../../services/utilityservice.ts"/>

module TalkwallApp {
	"use strict";

    export interface IFeedMessageController {
        deleteMessage(): void;
        editMessage(): void;
        togglePinMessage(): void;
        toggleHighlightMessage(): void;
	    isPinned(): boolean;
    }

	class FeedMessageController implements IFeedMessageController {
		static $inject = ['$scope', 'DataService', '$document', 'UtilityService', '$window'];

		public message: Message;
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
                this.message.isHighlighted = false;
				this.message.isHighlighted = (this.isPinned() && this.message.board[this.isolatedScope.selectedParticipant].highlighted);
            }
		};

		isPinned(): boolean {
			return (typeof this.message.board !== 'undefined' && typeof this.message.board[this.isolatedScope.selectedParticipant] !== 'undefined');
		}

		deleteMessage(): void {
			//check if authenticated or author
			if (this.message.creator === this.dataService.data.status.nickname || this.dataService.data.status.authorised) {
				this.message.deleted = true;
				this.dataService.updateMessage(this.message);
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

		togglePinMessage(): void {
			if (this.isPinned()) {
                delete this.message.board[this.dataService.data.status.nickname];
            } else {
                this.message.board[this.dataService.data.status.nickname] = new Nickname(
                    this.utilityService.getRandomBetween(45, 55) / 100,
                    this.utilityService.getRandomBetween(45, 55) / 100,
                    false
				)
			}
			this.dataService.updateMessage(this.message);
		}

		toggleHighlightMessage(): void {
			this.message.board[this.dataService.data.status.nickname].highlighted
                = !this.message.board[this.dataService.data.status.nickname].highlighted;
			this.message.isHighlighted = this.message.board[this.dataService.data.status.nickname].highlighted;
			this.dataService.updateMessage(this.message);
		}

		persistPosition(x, y): void {
			this.message.board[this.isolatedScope.selectedParticipant].xpos = x;
			this.message.board[this.isolatedScope.selectedParticipant].ypos = y;
			this.dataService.updateMessage(this.message);
		}

		getPinnedClass(): string {
			if (this.isPinned() && this.isolatedScope.onBoard === 'false') {
				return 'feedMessage-messageSelected';
			} else if (this.isolatedScope.onBoard === 'true' && this.message.board[this.isolatedScope.selectedParticipant].highlighted) {
				return 'feedMessage-messageOnBoardSelected';
			} else {
				return 'feedMessage-messageNotSelected';
			}
		}
	}

	function linker(isolatedScope: FeedMessageDirectiveScope , element: ng.IAugmentedJQuery,
	                attributes: ng.IAttributes, ctrl: FeedMessageController) {
		let viewWidthKey = 'VIEW_WIDTH', viewHeightKey = 'VIEW_HEIGHT';

		let messageWidth = element.prop('offsetWidth');
		let messageHeight = element.prop('offsetHeight');
		let currentSize = ctrl.dataService.data.status.boardDivSize;

		let offset = null;
		let participant = null;

		if (isolatedScope.onBoard === 'true') {
			positionMessage();
			//need a watch here, to refresh the position when the selected contributor or message position changes
			isolatedScope.$watch(() => { return ctrl.message.board[isolatedScope.selectedParticipant] }, (newValue) => { positionCSS() }, true);
		}

		function positionCSS() {
			participant = ctrl.message.board[isolatedScope.selectedParticipant];
			element.css({
				top: participant.ypos * 100 + '%',
				left: participant.xpos * 100 + '%'
			});
		}

		function positionMessage() {
			//positionCSS();

			element.on('mousedown touchstart', function(event) {
				// Prevent default dragging of selected content
				event.preventDefault();
				currentSize = ctrl.dataService.data.status.boardDivSize;
				messageWidth = element.prop('offsetWidth');
				messageHeight = element.prop('offsetHeight');

				if (event instanceof MouseEvent) {
					offset = {
						x: event.pageX - element.prop('offsetLeft'),
						y: event.pageY - element.prop('offsetTop'),
						originalX: event.pageX,
						originalY: event.pageY
					};
					ctrl.$document.on('mousemove', mousemove);
					ctrl.$document.on('mouseup', mouseup);
				} else if (event instanceof TouchEvent) {
					offset = {
						x: event['changedTouches'][0].pageX - element.prop('offsetLeft'),
						y: event['changedTouches'][0].pageY - element.prop('offsetTop'),
						originalX: event.pageX,
						originalY: event.pageY
					};
					element.on('touchmove', touchmove);
					element.on('touchend', touchend);
				}
				ctrl.dataService.stopPolling();
			});
		}

		function mousemove(event) {
			participant.xpos = event.pageX - offset.x;
			participant.ypos = event.pageY - offset.y;
			doMove();
		}

		function touchmove(event) {
			event.preventDefault();
			participant.xpos = event['changedTouches'][0].pageX - offset.x;
			participant.ypos = event['changedTouches'][0].pageY - offset.y;
			doMove();
		}

		function doMove() {
			if (participant.xpos < 0) {
				participant.xpos = 0;
			}
			if (participant.xpos > (currentSize[viewWidthKey] - messageWidth)) {
				participant.xpos = (currentSize[viewWidthKey] - messageWidth);
			}
			if (participant.ypos < 0) {
				participant.ypos = 0;
			}
			if (participant.ypos > (currentSize[viewHeightKey] - messageHeight)) {
				participant.ypos = (currentSize[viewHeightKey] - messageHeight);
			}
			element.css({
				top: participant.ypos + 'px',
				left: participant.xpos + 'px'
			});
			participant.xpos = participant.xpos / currentSize[viewWidthKey];
			participant.ypos = participant.ypos / currentSize[viewHeightKey];
		}

		function mouseup(event) {
			ctrl.$document.off('mousemove', mousemove);
			ctrl.$document.off('mouseup', mouseup);
			let diffX = offset.originalX - event.pageX;
			let diffY = offset.originalY - event.pageY;
			//will only persist if move greater than a 10 * 10px box
			if ( (diffX >= 10 || diffX <= -10 || diffY >= 10 || diffY <= -10) && isolatedScope.selectedParticipant === ctrl.dataService.data.status.nickname) {
				//ctrl.message.board[isolatedScope.selectedParticipant] = participant;
				ctrl.persistPosition(participant.xpos, participant.ypos);
			}
            ctrl.dataService.startPolling('none', 'none');
		}

		function touchend(event) {
			event.preventDefault();
			element.off('touchmove', touchmove);
			element.off('touchend', touchend);
			let diffX = offset.originalX - event.pageX;
			let diffY = offset.originalY - event.pageY;
			//will only persist if move greater than a 10 * 10px box
			if ( (diffX >= 10 || diffX <= -10 || diffY >= 10 || diffY <= -10) && isolatedScope.selectedParticipant === ctrl.dataService.data.status.nickname) {
				ctrl.persistPosition(participant.xpos, participant.ypos);
			}
			ctrl.dataService.startPolling('none', 'none');
		}
	}

	//isolated scope interface
	export interface FeedMessageDirectiveScope extends ng.IScope {
		data: Message;
		showEditPanel(): void;
		onBoard: string;
		selectedParticipant: string;
	}

	//directive declaration
	export function FeedMessage(): ng.IDirective {
		return {
			restrict: 'A',
			scope: {
				data: '=',
				showEditPanel: "&",
				onBoard: "@",
				selectedParticipant: '@'
			},
			templateUrl: 'js/components/feedMessage/feedMessage.html',
			controller: FeedMessageController,
			controllerAs: 'feedMessageC',
			link: linker,
			replace: true
		};
	}
}

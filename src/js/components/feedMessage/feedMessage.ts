/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>
/// <reference path="../../services/utilityservice.ts"/>

module TalkwallApp {
	"use strict";

    export interface IFeedMessageController {
        deleteMessage(event: Event): void;
        editMessage(event: Event): void;
        togglePinMessage(event: Event): void;
        toggleHighlightMessage(event: Event): void;
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

		toggleShowControls(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.showControls = !this.showControls;
		}

		isPinned(): boolean {
			return (typeof this.message.board !== 'undefined' && typeof this.message.board[this.isolatedScope.selectedParticipant] !== 'undefined');
		}

		deleteMessage(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			//check if authenticated or author
			if (this.message.creator === this.dataService.data.status.nickname || this.dataService.data.status.authorised) {
				this.message.deleted = true;
				this.dataService.logAnEvent(LogType.DeleteMessage, this.message._id, null);
				this.dataService.updateMessages([this.message], 'edit');
			}
			this.showControls = false;
		}

		editMessage(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			if (this.message.creator === this.dataService.data.status.nickname) {
				this.dataService.setMessageToEdit(this.message);
			} else {
				this.dataService.setMessageOrigin(this.message);
				this.dataService.setMessageToEdit(null);
			}
			this.isolatedScope.showEditPanel();
			this.showControls = false;
		}

		togglePinMessage(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			if (this.isPinned()) {
                delete this.message.board[this.dataService.data.status.nickname];
				this.dataService.logAnEvent(LogType.UnPinMessage, this.message._id, null);
            } else {
                this.message.board[this.dataService.data.status.nickname] = new Nickname(
                    this.utilityService.getRandomBetween(45, 55) / 100,
                    this.utilityService.getRandomBetween(45, 55) / 100,
                    false
				);
				this.dataService.logAnEvent(LogType.PinMessage, this.message._id, null);
			}
			this.dataService.updateMessages([this.message], 'position');
			this.showControls = false;
		}

		toggleHighlightMessage(event): void {
			if(event !== null) {
				event.preventDefault();
				event.stopPropagation();
			}
			if (this.dataService.data.status.selectedParticipant === this.dataService.data.status.nickname) {
				this.message.board[this.dataService.data.status.nickname].highlighted
					= !this.message.board[this.dataService.data.status.nickname].highlighted;
				let highlightLogText = this.message.board[this.dataService.data.status.nickname].highlighted
					? LogType.HighlightMessage : LogType.UnHighlightMessage;
				this.message.isHighlighted = this.message.board[this.dataService.data.status.nickname].highlighted;
				this.dataService.logAnEvent(highlightLogText, this.message._id, null);
				this.dataService.updateMessages([this.message], 'position');
				this.showControls = false;
			}
		}

		persistPosition(xPercentage, yPercentage, oldPercentagePosition): void {
			this.dataService.logAnEvent(LogType.MoveMessage, this.message._id, {
				x: oldPercentagePosition.x - xPercentage,
				y: oldPercentagePosition.y - yPercentage,
			});
			this.message.board[this.isolatedScope.selectedParticipant].xpos = xPercentage;
			this.message.board[this.isolatedScope.selectedParticipant].ypos = yPercentage;
			this.dataService.updateMessages([this.message], 'position');
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
		let pixelPosition = {x: 0, y: 0};
		let oldPercentagePosition = {x: 0, y: 0};
		let participant = null;

		/*
		if (isolatedScope.onBoard === 'true') {
			positionMessage();
			//need a watch here, to refresh the position when the selected contributor or message position changes
			isolatedScope.$watch(() => { return ctrl.message.board[isolatedScope.selectedParticipant] }, (newValue) => { positionCSS() }, true);
		}
		*/

		isolatedScope.$on("talkwallMessageUpdate", function(event, newParticipant) {
			if (isolatedScope.onBoard === 'true') {
				if (typeof ctrl.message.board !== 'undefined' && typeof ctrl.message.board[newParticipant] !== 'undefined') {
					participant = ctrl.message.board[newParticipant];
					setMessageCss();
				}
			}
		});

		function setMessageCss() {
			element.css({
				top: participant.ypos * 100 + '%',
				left: participant.xpos * 100 + '%'
			});
		}

		function positionMessage() {

			element.on('mousedown touchstart', function(event) {
				// Prevent touches from other places
				/*
				if(event.currentTarget['id'].indexOf('message-') === -1) {
					return;
				}
				*/
				currentSize = ctrl.dataService.data.status.boardDivSize;
				messageWidth = element.prop('offsetWidth');
				messageHeight = element.prop('offsetHeight');
				oldPercentagePosition = {x: participant.xpos, y: participant.ypos};

				if (event instanceof MouseEvent) {
					offset = {
						x: event.pageX - element.prop('offsetLeft'),
						y: event.pageY - element.prop('offsetTop'),
						originalX: event.pageX,
						originalY: event.pageY
					};
					element.on('mousemove', mousemove);
					element.on('mouseup', mouseup);
				} else if (event instanceof TouchEvent) {
					let offsetLeft = element.prop('offsetLeft');
					let offsetRight = element.prop('offsetTop');
					offset = {
						x: event['targetTouches'][0].pageX - offsetLeft,
						y: event['targetTouches'][0].pageY - offsetRight,
						originalX: event.pageX,
						originalY: event.pageY
					};
					element.on('touchmove', touchmove);
					element.on('touchend', touchend);
				}
				ctrl.dataService.stopPolling();
				ctrl.dataService.restrictRequests();
			});
		}

		function mousemove(event) {
			pixelPosition.x = event.pageX - offset.x;
			pixelPosition.y = event.pageY - offset.y;
			doMove();
		}

		function touchmove(event) {
			event.preventDefault();
			pixelPosition.x = event['targetTouches'][0].pageX - offset.x;
			pixelPosition.y = event['targetTouches'][0].pageY - offset.y;
			doMove();
		}

		function doMove() {
			if (pixelPosition.x < 0) {
				pixelPosition.x = 0;
			}
			if (pixelPosition.x > (currentSize[viewWidthKey] - messageWidth)) {
				pixelPosition.x = (currentSize[viewWidthKey] - messageWidth);
			}
			if (pixelPosition.y < 0) {
				pixelPosition.y = 0;
			}
			if (pixelPosition.y > (currentSize[viewHeightKey] - messageHeight)) {
				pixelPosition.y = (currentSize[viewHeightKey] - messageHeight);
			}
			/*
			element.css({
				top: pixelPosition.y + 'px',
				left: pixelPosition.x + 'px'
			});
			*/
			participant.xpos = pixelPosition.x / currentSize[viewWidthKey];
			participant.ypos = pixelPosition.y / currentSize[viewHeightKey];
			setMessageCss();
		}

		function mouseup(event) {
			let diffX = offset.originalX - event.pageX;
			let diffY = offset.originalY - event.pageY;
			//will only persist if move greater than a 10 * 10px box
			if ((diffX >= 10 || diffX <= -10 || diffY >= 10 || diffY <= -10) && isolatedScope.selectedParticipant === ctrl.dataService.data.status.nickname) {
				//ctrl.message.board[isolatedScope.selectedParticipant] = participant;
				ctrl.persistPosition(participant.xpos, participant.ypos, oldPercentagePosition);
			}
			element.off('mousemove', mousemove);
			element.off('mouseup', mouseup);
            ctrl.dataService.startPolling();
		}

		function touchend(event) {
			let diffX = offset.originalX - event.pageX;
			let diffY = offset.originalY - event.pageY;
			//will only persist if move greater than a 10 * 10px box
			if ((diffX >= 10 || diffX <= -10 || diffY >= 10 || diffY <= -10) && isolatedScope.selectedParticipant === ctrl.dataService.data.status.nickname) {
				ctrl.persistPosition(participant.xpos, participant.ypos, oldPercentagePosition);
			}
			event.preventDefault();
			element.off('touchmove', touchmove);
			element.off('touchend', touchend);

			ctrl.dataService.startPolling();
		}

		if (isolatedScope.onBoard === 'true') {
			participant = ctrl.message.board[isolatedScope.selectedParticipant];
			positionMessage();
			setMessageCss();
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

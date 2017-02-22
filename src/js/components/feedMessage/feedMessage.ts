/*
 Copyright 2016, 2017 Richard Nesnass and Jeremy Toussaint

 This file is part of Talkwall.

 Talkwall is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Talkwall is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Talkwall.  If not, see <http://www.gnu.org/licenses/>.
 */

import {Message, LogType, Nickname} from '../../models/models';
import {DataService} from "../../services/dataservice";
import {UtilityService} from "../../services/utilityservice";

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

	toggleShowControls(): void {
		this.showControls = !this.showControls;
	}

	isPinned(): boolean {
		return (typeof this.message.board !== 'undefined' && typeof this.message.board[this.isolatedScope.selectedParticipant] !== 'undefined');
	}

	deleteMessage(): void {
		//check if I am authenticated viewing the participant, or the actual author
		if (this.message.creator === this.isolatedScope.selectedParticipant || this.dataService.data.status.authorised) {
			this.message.deleted = true;
			this.dataService.logAnEvent(LogType.DeleteMessage, this.message._id, null, this.message.text, null, '');
			this.dataService.updateMessages([this.message], 'edit');
		}
		this.showControls = false;
	}

	editMessage(): void {
		this.dataService.setMessageToEdit(this.message);
		this.isolatedScope.showEditPanel();
		this.showControls = false;
	}

	togglePinMessage(): void {
		if (this.isPinned()) {
			delete this.message.board[this.dataService.data.status.selectedParticipant];
			this.dataService.logAnEvent(LogType.UnPinMessage, this.message._id, null, this.message.text, this.message.origin, '');
		} else {
			this.message.board[this.dataService.data.status.selectedParticipant] = new Nickname(
				this.utilityService.getRandomBetween(45, 55) / 100,
				this.utilityService.getRandomBetween(45, 55) / 100,
				false
			);
			this.dataService.logAnEvent(LogType.PinMessage, this.message._id, null, this.message.text, null, '');
		}
		this.dataService.updateMessages([this.message], 'position');
		this.showControls = false;
	}

	toggleHighlightMessage(): void {
		this.message.board[this.dataService.data.status.selectedParticipant].highlighted = !this.message.board[this.dataService.data.status.selectedParticipant].highlighted;
		let highlightLogText = this.message.board[this.dataService.data.status.selectedParticipant].highlighted ? LogType.HighlightMessage : LogType.UnHighlightMessage;
		this.message.isHighlighted = this.message.board[this.dataService.data.status.selectedParticipant].highlighted;
		this.dataService.logAnEvent(highlightLogText, this.message._id, null, this.message.text, null, '');
		this.dataService.updateMessages([this.message], 'position');
		this.showControls = false;
	}

	persistPosition(xPercentage: number, yPercentage: number, oldPercentagePosition: { x: number, y: number}): void {
		this.dataService.logAnEvent(LogType.MoveMessage, this.message._id, {
			x: oldPercentagePosition.x - xPercentage,
			y: oldPercentagePosition.y - yPercentage,
		}, this.message.text, null, '');
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

function linker(isolatedScope: FeedMessageDirectiveScope , element: JQuery,
				attributes: ng.IAttributes, ctrl: FeedMessageController) {
	let viewWidthKey = 'VIEW_WIDTH', viewHeightKey = 'VIEW_HEIGHT';

	let messageWidth = element.prop('offsetWidth');
	let messageHeight = element.prop('offsetHeight');
	let currentSize = ctrl.dataService.data.status.boardDivSize;

	let offset: {x: number, y: number, originalX: number, originalY: number} = null;
	let pixelPosition = {x: 0, y: 0};
	let oldPercentagePosition = {x: 0, y: 0};
	let participant: Nickname;
	let restrictingRequestsAlready: boolean = false;

	/*
	if (isolatedScope.onBoard === 'true') {
		positionMessage();
		//need a watch here, to refresh the position when the selected contributor or message position changes
		isolatedScope.$watch(() => { return ctrl.message.board[isolatedScope.selectedParticipant] }, (newValue) => { positionCSS() }, true);
	}
	*/

	/*
	isolatedScope.$on("talkwallMessageUpdate", function(event, newParticipant) {
		if (isolatedScope.onBoard === 'true') {
			if (typeof ctrl.message.board !== 'undefined' && typeof ctrl.message.board[newParticipant] !== 'undefined') {
				participant = ctrl.message.board[newParticipant];
				setMessageCss();
			}
		}
	});
	*/

	isolatedScope.$on("talkwallMessageRefresh", function() {
		if (isolatedScope.onBoard === 'true' && ctrl.message.board.hasOwnProperty(isolatedScope.selectedParticipant)) {
			participant = ctrl.message.board[isolatedScope.selectedParticipant];
			setMessageCss();
		}
	});

	function setMessageCss() {
		element.css({
			top: participant.ypos * 100 + '%',
			left: participant.xpos * 100 + '%'
		});
	}

	function setTransitionCss(active: boolean) {
		if(active) {
			element.css({
				'-webkit-transition': 'all 0.5s linear',
				'-moz-transition': 'all 0.5s linear',
				'-o-transition': 'all 0.5s linear',
				'transition': 'all 0.5s linear'
			})
		} else {
			element.css({
				'-webkit-transition-duration': '0s',
				'-moz-transition-duration': '0s',
				'-o-transition-duration': '0s',
				'transition-duration': '0s'
			})
		}
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
			setTransitionCss(false);

			if (event instanceof MouseEvent) {
				offset = {
					x: event.pageX - element.prop('offsetLeft'),
					y: event.pageY - element.prop('offsetTop'),
					originalX: event.pageX,
					originalY: event.pageY
				};
				ctrl.$document.on('mousemove', mousemove);
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
		});
	}

	function mousemove(event: JQueryEventObject) {
		pixelPosition.x = event.pageX - offset.x;
		pixelPosition.y = event.pageY - offset.y;
		doMove();
	}

	function touchmove(event: JQueryEventObject) {
		event.preventDefault();
		pixelPosition.x = event['targetTouches'][0].pageX - offset.x;
		pixelPosition.y = event['targetTouches'][0].pageY - offset.y;
		doMove();
	}

	function doMove() {
		if (!restrictingRequestsAlready) {
			ctrl.dataService.restrictRequests();
		}
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

		participant.xpos = pixelPosition.x / currentSize[viewWidthKey];
		participant.ypos = pixelPosition.y / currentSize[viewHeightKey];
		setMessageCss();
	}

	function mouseup(event: JQueryEventObject) {
		restrictingRequestsAlready = false;
		let diffX = offset.originalX - event.pageX;
		let diffY = offset.originalY - event.pageY;
		//will only persist if move greater than a 10 * 10px box
		if (diffX >= 10 || diffX <= -10 || diffY >= 10 || diffY <= -10) {
			//ctrl.message.board[isolatedScope.selectedParticipant] = participant;
			ctrl.persistPosition(participant.xpos, participant.ypos, oldPercentagePosition);
		}
		ctrl.$document.off('mousemove', mousemove);
		element.off('touchmove', touchmove);
		element.off('mouseup', mouseup);
		ctrl.dataService.startPolling();
		setTransitionCss(true);
	}

	function touchend(event: JQueryEventObject) {
		let diffX = offset.originalX - event.pageX;
		let diffY = offset.originalY - event.pageY;
		//will only persist if move greater than a 10 * 10px box
		if (diffX >= 10 || diffX <= -10 || diffY >= 10 || diffY <= -10) {
			ctrl.persistPosition(participant.xpos, participant.ypos, oldPercentagePosition);
		}
		event.preventDefault();
		ctrl.$document.off('mousemove', mousemove);
		element.off('touchmove', touchmove);
		element.off('touchend', touchend);
		ctrl.dataService.startPolling();
	}

	if (isolatedScope.onBoard === 'true' && ctrl.message.board.hasOwnProperty(isolatedScope.selectedParticipant)) {
		participant = ctrl.message.board[isolatedScope.selectedParticipant];
		positionMessage();
		setMessageCss();
		setTransitionCss(true);
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
			magnified: '=',
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
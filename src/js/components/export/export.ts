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

import IRouteParamsService = angular.route.IRouteParamsService;
import IDialogService = angular.material.IDialogService;
import * as models from '../../models/models';
import {DataService} from "../../services/dataservice";
import * as moment from "moment";

export class ExportController {
	static $inject = ['DataService', '$routeParams', '$mdDialog'];

	private wall: models.Wall = null;

	constructor(
		private dataService: DataService,
		private $routeParams: IRouteParamsService,
		private $mdDialog: IDialogService) {
		console.log('--> ExportController: started');
		let handle = this;
		let wallKey = 'wid';
		let tokenParam = this.$routeParams[wallKey] || '';
		if (tokenParam !== '') {
			//look at the route params first for wall id
			console.log('--> DataService: token from parameter: ' + tokenParam);
			this.dataService.getExportWall(tokenParam,
				function(wall: models.Wall) {
					handle.wall = wall;
					//handle.wallDate = handle.getFormattedDate();
				},
				function(error: {}) {
					console.log('--> ExportController: getExportWall: error: ' + angular.toJson(error));
				}
			);

		} else {
			//no wall id provided, show an alert
			this.$mdDialog.show(
				this.$mdDialog.alert()
					.clickOutsideToClose(true)
					.title('Wall ID missing')
					.textContent('Please provide a valid wall ID to export its content.' +
						'The URL should be in the form: http://...talkwall.net/#/export?wid=WALL_ID')
					.ok('OK')
			);
		}
	}

	static getFormattedDate(date: Date): string {
		if (date !== null) {
			return moment(date).format('DD/MM/YYYY - HH:mm');
		}
	}

	getBoardMessagesForContributor(contributor: string, qid: string): Array<models.Message> {
		let result: Array<models.Message> = [];
		let leftSorting: {} = {};
		let rightSorting: {} = {};

		let targetQuestion: models.Question;
		this.wall.questions.forEach(function (question: models.Question) {
			if (question._id === qid) {
				targetQuestion = question;
			}
		});

		if (targetQuestion) {
			targetQuestion.messages.forEach(function (message: models.Message) {
				if (typeof message.board !== 'undefined' && typeof message.board[contributor] !== 'undefined') {
					if (message.board[contributor].xpos < 0.5) {
						leftSorting[message.board[contributor].ypos] = message;
					} else {
						rightSorting[message.board[contributor].ypos] = message;
					}
				}
			});
		}

		let leftKeys = Object.keys(leftSorting);
		let rightKeys = Object.keys(rightSorting);

		for (let i = 0; i < leftKeys.length; i++) {
			result.push(leftSorting[leftKeys[i]]);
		}

		for (let i = 0; i < rightKeys.length; i++) {
			result.push(rightSorting[rightKeys[i]]);
		}

		return result;
	}
}

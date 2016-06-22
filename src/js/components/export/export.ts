/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	import IRouteParamsService = angular.route.IRouteParamsService;
	import IDialogService = angular.material.IDialogService;

	export class ExportController {
		static $inject = ['DataService', '$routeParams', '$mdDialog'];

		private wall: Wall = null;
		private selectedQuestionIndex: number = -1;

		constructor(
			private dataService: DataService,
			private $routeParams: IRouteParamsService,
			private $mdDialog: IDialogService) {
			console.log('--> ExportController: started');
			var handle = this;
			let wallKey = 'wid';
			var tokenParam = this.$routeParams[wallKey] || '';
			if (tokenParam !== '') {
				//look at the route params first for wall id
				console.log('--> DataService: token from parameter: ' + tokenParam);
				this.dataService.getExportWall(tokenParam,
					function(wall: Wall) {
						handle.wall = wall;
						//handle.wallDate = handle.getFormattedDate();
					},
					function(error) {
						console.log('--> ExportController: getExportWall: error: ' + angular.toJson(error));
					}
				);

			} else {
				//no wall id provided, show an alert
				this.$mdDialog.show(
					this.$mdDialog.alert()
						.clickOutsideToClose(true)
						.title('Wall ID missing')
						.content('Please provide a valid wall ID to export its content.' +
							'The URL should be in the form: http://...talkwall.net/#/export?wid=WALL_ID')
						.ok('OK')
				);
			}
		}

		getFormattedDate(date: Date): string {
			if (date !== null) {
				return moment(date).format('MM/DD/YYYY - HH:mm');
			}
		}

		getBoardMessagesForParticipant(participant: string, qid: string): Array<Message> {
			var result: Array<Message> = new Array();
			var leftSorting: {} = {};
			var rightSorting: {} = {};

			var targetQuestion: Question;
			this.wall.questions.forEach(function (question) {
				if (question._id === qid) {
					targetQuestion = question;
				}
			});

			targetQuestion.messages.forEach(function (message) {
				if (message.board !== undefined && message.board[participant] !== undefined) {
					if (message.board[participant].xpos < 0.5) {
						leftSorting[message.board[participant].ypos] = message;
					} else {
						rightSorting[message.board[participant].ypos] = message;
					}
				}
			});

			var leftKeys = Object.keys(leftSorting);
			var rightKeys = Object.keys(rightSorting);

			for (var i = 0; i < leftKeys.length; i++) {
				result.push(leftSorting[leftKeys[i]]);
			}

			for (var i = 0; i < rightKeys.length; i++) {
				result.push(rightSorting[rightKeys[i]]);
			}

			return result;
		}
	}
}

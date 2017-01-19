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

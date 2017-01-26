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

"use strict";
import {Question} from "../../models/models";
import {DataService} from "../../services/dataservice";

export interface ITaskQuestionController {
	deleteQuestion(): void;
	editQuestion(): void;
}

class TaskQuestionController implements ITaskQuestionController {
	static $inject = ['$scope', 'DataService', '$mdDialog'];

	private question: Question;
	private showControls: boolean;

	constructor(
		private isolatedScope: TaskQuestionDirectiveScope,
		public dataService: DataService,
		private $mdDialog: angular.material.IDialogService) {
			this.question = isolatedScope.data;
			this.showControls = false;
	};

	deleteQuestion(): void {
		console.log('--> TaskController delete');
		let handle = this;
		this.dataService.deleteQuestion(this.question,
			function(code: number) {
				if (code === 401) {
					handle.$mdDialog.show(
						handle.$mdDialog.alert()
							.clickOutsideToClose(true)
							.title('Question not deleted')
							.textContent('This question contains messages and cannot be deleted anymore.')
							.ok('OK')
					);
				} else {
					//200 => set question to 0
					handle.dataService.setQuestion(0, null, null);
				}
			},
			function(error: {}) {
				console.log('--> TaskController deleteQuestion error: ' + error);
			}
		);
	}

	editQuestion(): void {
		console.log('--> TaskController edit');
		this.dataService.setQuestionToEdit(this.question);
	}
}

//isolated scope interface
export interface TaskQuestionDirectiveScope extends ng.IScope {
	data: Question;
}

//directive declaration
export function TaskQuestion(): ng.IDirective {
	return {
		restrict: 'A',
		scope: {
			data: '='
		},
		templateUrl: 'js/components/taskQuestion/taskQuestion.html',
		controller: TaskQuestionController,
		controllerAs: 'taskQuestionC',
		replace: true
	};
}
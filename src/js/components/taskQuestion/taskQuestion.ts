/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";

	export interface ITaskQuestionController {
		deleteQuestion(event): void;
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

		deleteQuestion(event): void {
			console.log('--> TaskController delete');
			let handle = this;
			this.dataService.deleteQuestion(this.question,
				function(code) {
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
				function(error) {
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
}

/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	class TaskController {
		static $inject = ['$scope', 'DataService', '$mdDialog'];

		private question: Question;

		constructor(
			private isolatedScope: TaskDirectiveScope,
			public dataService: DataService,
			private $mdDialog: IDialogService) {
			this.question = isolatedScope.data;
		};

		/**
		 * init
		 */
		activate(): void {
			console.log('--> TaskController activated');
		}

		deleteQuestion(ev): void {
			console.log('--> TaskController delete');
			var handle = this;
			this.dataService.deleteQuestion(this.question,
				function(code) {
					if (code === 401) {
						handle.$mdDialog.show(
							handle.$mdDialog.alert()
								.clickOutsideToClose(true)
								.title('Question not deleted')
								.content('This question contains messages and cannot be deleted anymore.')
								.ok('OK')
						);
					} else {
						//200 => set question to 0
						handle.dataService.setQuestion(0,
							() => {
								//success
							},
							function() {
								//error
							}
						);
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
	export interface TaskDirectiveScope extends ng.IScope {
		data: Question;
	}

	//directive declaration
	export function Task(): ng.IDirective {
		return {
			restrict: 'A',
			scope: {
				data: '='
			},
			templateUrl: 'js/components/task/task.html',
			controller: TaskController,
			controllerAs: 'taskC',
			replace: true
		};
	}
}

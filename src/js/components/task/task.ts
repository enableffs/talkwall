/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	class TaskController {
		static $inject = ['$scope', 'DataService'];

		private question: Question;

		constructor(
			private isolatedScope: TaskDirectiveScope,
			public dataService: DataService) {
			this.question = isolatedScope.data;
		};

		/**
		 * init
		 */
		activate(): void {
			console.log('--> TaskController activated');
		}

		deleteQuestion(): void {
			console.log('--> TaskController delete');
			this.dataService.deleteQuestion(this.question);
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

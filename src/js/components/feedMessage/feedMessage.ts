/// <reference path="../../_references.ts"/>
/// <reference path="../../models/models.ts"/>

module TalkwallApp {
	"use strict";
	class FeedMessageController {
		static $inject = ['$scope'];

		private message: Message;
		private showControls: boolean = false;

		constructor(private isolatedScope: FeedMessageDirectiveScope) {
			this.message = isolatedScope.message;
		};

		/**
		 * init
		 */
		activate(): void {
			console.log('--> FeedMessageController activated');
		}
	}

	//isolated scope interface
	export interface FeedMessageDirectiveScope {
		message: Message;
	}

	//directive declaration
	export function FeedMessage(): ng.IDirective {
		return {
			restrict: 'A',
			scope: {
				message: '='
			},
			templateUrl: 'js/components/feedMessage/feedMessage.html',
			controller: FeedMessageController,
			controllerAs: 'feedMessageC',
			replace: true
		};
	}
}

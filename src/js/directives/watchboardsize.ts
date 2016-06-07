/// <reference path="../_references.ts"/>
/// <reference path="../services/dataservice.ts"/>

module TalkwallApp {

	"use strict";
	export interface WatchBoardSizeControllerDirectiveScope extends ng.IScope {
		getWindowDimensions(): {};
	}

	class WatchBoardSizeController {
		static $inject: string[] = ['DataService', '$window'];
		constructor(public dataService: DataService, public $window: angular.IWindowService) {
		};
	}

	function linker(scope: WatchBoardSizeControllerDirectiveScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes,
	                ctrl: WatchBoardSizeController) {
		var w = angular.element(ctrl.$window);
		scope.getWindowDimensions = function () {
			return {
				'VIEW_HEIGHT': element.prop('offsetHeight'),
				'VIEW_WIDTH': element.prop('offsetWidth')
			};
		};
		scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
			ctrl.dataService.setBoardDivSize(newValue);
		}, true);

		w.bind('resize', function () {
			scope.$apply();
		});

		ctrl.dataService.setBoardDivSize(scope.getWindowDimensions());
	}

	export function WatchBoardSize(): ng.IDirective {
		return {
			restrict: 'A',
			controller: WatchBoardSizeController,
			link: linker
		};
	}
}

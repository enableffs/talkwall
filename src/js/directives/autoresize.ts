/// <reference path="../_references.ts"/>

module SamtavlaApp {

	"use strict";

	AutoResize.$inject = ['$window'];
	export function AutoResize($window: ng.IWindowService) {

		var link: ng.IDirectiveLinkFn = function (scope: ng.IRootScopeService, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
			function initializeWindowSize(): void {
				let mhKey = 'maxHeight', whKey = 'windowHeight', wwKey = 'windowWidth';
				scope[mhKey] = Math.max(
					document.body.scrollHeight, document.documentElement.scrollHeight,
					document.body.offsetHeight, document.documentElement.offsetHeight,
					document.body.clientHeight, document.documentElement.clientHeight,
					window.innerHeight
				);
				scope[whKey] = $window.innerHeight;
				scope[wwKey] = $window.innerWidth;
			}

			initializeWindowSize();

			scope.$watch('__height', () => {
				initializeWindowSize();
			});

			angular.element($window).bind('resize', () => {

				initializeWindowSize();
				return scope.$apply();

			});
		};

		return {
			link: link
		};
	}
}

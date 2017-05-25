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

AutoResize.$inject = ['$window'];
export function AutoResize($window: ng.IWindowService) {

	let link: ng.IDirectiveLinkFn = function (scope: ng.IRootScopeService, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
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
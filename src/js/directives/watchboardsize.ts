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
import {DataService} from "../services/dataservice";
import { IController } from "angular";
export interface WatchBoardSizeControllerDirectiveScope extends ng.IScope {
	getWindowDimensions(): {};
}

class WatchBoardSizeController implements IController {
	static $inject: string[] = ['DataService', '$window'];
	$onInit() { }
	constructor(public dataService: DataService, public $window: angular.IWindowService) {
	};
}

function linker(scope: WatchBoardSizeControllerDirectiveScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes,
				ctrl: WatchBoardSizeController) {
	let w = angular.element(ctrl.$window);
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
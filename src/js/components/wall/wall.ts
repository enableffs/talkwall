/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";
	import IDialogService = angular.material.IDialogService;
	import IMedia = angular.material.IMedia;
	import IScope = angular.IScope;
	import IWindowService = angular.IWindowService;
	import IRouteParamsService = angular.route.IRouteParamsService;
	import ILocationService = angular.ILocationService;

	export interface IWallControllerService {
		/**
		 * init function for this controller
		 */
		activate(): void;
	}

	export class WallController implements IWallControllerService {
		static $inject = ['URLService', 'DataService'];

		constructor(
			private urlService: IURLService,
			private dataService: DataService) {
			console.log('--> WallController: started: ');

			if (this.dataService.checkAuthenticated()) {
				this.activate();
			}
		}

		activate(): void {
			console.log('--> WallController: activated: ');
		}
	}
}

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

import {Wall, User} from '../../models/models';
import {DataService} from "../../services/dataservice";
import {UtilityService} from "../../services/utilityservice";

export interface IOrganiserItemController {
	deleteWall(): void;
	toggleEditDetails(): void;
	toggleLock(): void;
	editOrganisers(): void;
	shareWall(): void;
	deleteWall(): void;
	submitOrganiser(): void;
	submitGroupTheme(): void;
}

class OrganiserItemController implements IOrganiserItemController {
	static $inject = ['$scope', 'DataService', '$document', 'UtilityService', '$window', '$location', '$timeout'];

	public wall: Wall;
	private showControls: boolean = false;
	private showEditor: boolean = false;
	private timeFromNow: string;
	private totalContributors: number;
	private totalMessages: number;
	private newGroup: string;
	private newTheme: string;
	private organisers: string[] = [];
	private newOrganiserEmail: string = '';
	private checkNameTimeout: any;
	private nameExists: boolean = true;

	constructor(
		private isolatedScope: OrganiserItemDirectiveScope,
		public dataService: DataService,
		public $document: ng.IDocumentService,
		public utilityService: UtilityService,
		public $window: ng.IWindowService,
		public $location: ng.ILocationService,
		public $timeout: ng.ITimeoutService) {

		this.wall = isolatedScope.data;
		this.timeFromNow = UtilityService.getFormattedDateTimeFromNow(this.wall.lastOpenedAt);
		this.newGroup = this.wall.label;
		this.newTheme = this.wall.theme;
		this.wall.organisers.forEach((o: User) => {
			this.organisers.push(o.defaultEmail);
		});
		this.totalContributors = this.totalMessages = 0;
		this.wall.questions.forEach((q) => {
			this.totalContributors += q.contributors.length;
			this.totalMessages += q.messages.length;
		});

	};

	organiserFilter = (item: any) => {
	    return item.nickname !== this.dataService.data.user.nickname;
    };

	toggleShowControls(): void {
		this.showControls = !this.showControls;
		this.showEditor = false;
	}

	toggleEditDetails(): void {
		this.showEditor = !this.showEditor;
        this.nameExists = false;
		this.showControls = false;
	}

	toggleLock(): void {
		this.wall.closed = !this.wall.closed;
		this.dataService.updateWall(this.wall, (wall: Wall) => {
			this.wall.pin = wall.pin;
		}, () => {
			console.log('error updating wall');
		});
		this.showControls = false;
	}

	editOrganisers(): void {
		this.showControls = false;
	}

	shareWall(): void {
		this.showControls = false;
	}

	exportWall(): void {
		this.$location.url('/export?wid=' + this.wall._id);
	}

	deleteWall(): void {
		this.wall.deleted = true;
		this.dataService.updateWall(this.wall, null, null);
		this.showControls = false;
	}

	checkOrganiserEmail(): void {
		this.$timeout.cancel(this.checkNameTimeout);
		if (this.newOrganiserEmail === '') {
			return;
		}
		this.checkNameTimeout = this.$timeout(() => {
			this.dataService.userExists(this.newOrganiserEmail, (exists) => {
				this.nameExists = exists;
			}, () => {
				console.log('Error checking organiser exists');
			});
		}, 1000);
	}

	submitGroupTheme(): void {
		if (this.newGroup !== this.wall.label || this.newTheme !== this.wall.theme) {
			this.wall.label = this.newGroup;
			this.wall.theme = this.newTheme;
			this.dataService.updateWall(this.wall, (updatedWall: Wall) => {
				this.wall = updatedWall;
			}, null);
		}
	}

	submitOrganiser(): void {
		if (this.newOrganiserEmail !== '') {
			this.wall['newOrganiser'] = this.newOrganiserEmail;
		}
		this.dataService.updateWall(this.wall, () => {
			this.organisers.push(this.newOrganiserEmail);
			this.newOrganiserEmail = '';
			this.nameExists = false;
		}, null);
	}

}

//isolated scope interface
export interface OrganiserItemDirectiveScope extends ng.IScope {
	data: Wall;
	showEditPanel(): void;
	openThisWall(): void;
}

//directive declaration
export function OrganiserItem(): ng.IDirective {
	return {
		restrict: 'A',
		scope: {
			data: '=',
			showEditPanel: "&",
			openThisWall: "&"
		},
		templateUrl: 'js/components/organiserItem/organiserItem.html',
		controller: OrganiserItemController,
		controllerAs: 'orgItemC',
		replace: true
	};
}
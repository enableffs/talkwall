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

import {Wall} from '../../models/models';
import {URLService} from "../../services/urlservice";
import * as moment from 'moment';
import Moment = moment.Moment;

export class SessionInfoController {
	static $inject = ['URLService', '$translate', '$http', '$window', '$interval'];

	//vars
	private data: { pin: string, error: string, showResult: boolean, wall: Wall, name: string, sessionid: string };
	private timestring: string;
	private datestring: string;
	private clapper: string;
	private languageCode: string = 'no';

	constructor(private urlService: URLService,
				private $translate: any,
				private $http: angular.IHttpService,
				private $window: angular.IWindowService,
				private $interval: angular.IIntervalService) {
		let langKey: string = 'lang';
		this.languageCode = this.$window.sessionStorage[langKey];
		this.$translate.use(this.languageCode);

		this.data = {
			pin: '',
			error: '',
			showResult: false,
			wall: null,
			name: '',
			sessionid: ''
		};

		this.datestring = '';
		this.timestring = '';
		this.clapper = 'images/clapper1.png';

	}

	exportCSV() {

	}

	activate() {
		this.$http.get(this.urlService.getHost() + '/clientwall/none/' + this.data.pin)
			.then((success) => {
				this.data.wall = success['data']['result'];
				if (this.data.wall.createdBy['google'].hasOwnProperty('name')) {
					this.data.name = this.data.wall.createdBy['google'].name;
				} else if (this.data.wall.createdBy['facebook'].hasOwnProperty('name')) {
					this.data.name = this.data.wall.createdBy['facebook'].name;
				} else if (this.data.wall.createdBy['local'].hasOwnProperty('name')) {
					this.data.name = this.data.wall.createdBy['local'].name;
				}
				this.data.showResult = true;

				SessionInfoController.GetMomentClock();
				this.$interval(() => {
					let data = SessionInfoController.GetMomentClock();
					this.datestring = data.date;
					this.timestring = data.time;
					this.clapper = this.clapper === 'images/clapper1.png' ? 'images/clapper2.png' : 'images/clapper1.png';
				}, 1000);

			}, () => {
				this.data.error = 'No session found';
			});
	}

	static GetMomentClock() {
	    let d = moment().utc();
	    return { date: d.format('YYYY-MM-DD'), time: d.format('HH:mm:ss') }
    }

	static GetClock() {
		let tday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		let tmonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		let d = new Date();
		let nday = d.getDay(), nmonth = d.getMonth(), ndate = d.getDate(), nyear = d.getFullYear();
		if (nyear < 1000) {
			nyear += 1900;
		}
		let nhour = d.getHours(), nmin = d.getMinutes(), nsec = d.getSeconds(), ap: string, nminString: string, nsecString: string;

		if (nhour == 0) {
			ap = " AM";
			nhour = 12;
		}
		else if (nhour < 12) {
			ap = " AM";
		}
		else if (nhour == 12) {
			ap = " PM";
		}
		else if (nhour > 12) {
			ap = " PM";
			nhour -= 12;
		}

		nminString = (nmin <= 9) ? "0" + nmin : nmin.toString();
		nsecString = (nsec <= 9) ? "0" + nsec : nsec.toString();

		return { date: tday[nday] + ", " + tmonth[nmonth] + " " + ndate + ", " + nyear,
			time: nhour + ":" + nminString + ":" + nsecString + ap + "" }
	}
}
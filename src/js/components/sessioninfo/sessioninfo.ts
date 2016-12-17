/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>
/// <reference path="../login/login.ts"/>
/// <reference path="../join/join.ts"/>
/// <reference path="../../services/dataservice.ts"/>

module TalkwallApp {
	"use strict";

	export class SessionInfoController {
		static $inject = ['URLService', '$translate', '$http', '$window', '$interval'];

		//vars
		private data;
		private timestring;
		private datestring;
		private languageCode: string = 'no';

		constructor(private urlService: IURLService,
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
				wall: Wall,
				name: ''
			};

			this.datestring = '';
			this.timestring = '';

		}

		activate() {
			this.$http.get(this.urlService.getHost() + '/clientwall/none/' + this.data.pin)
                .then((success) => {
					this.data.wall = success['data']['result'];
					if (this.data.wall.createdBy.google.hasOwnProperty('name')) {
						this.data.name = this.data.wall.createdBy.google.name;
					} else if (this.data.wall.createdBy.facebook.hasOwnProperty('name')) {
						this.data.name = this.data.wall.createdBy.facebook.name;
					} else if (this.data.wall.createdBy.local.hasOwnProperty('name')) {
						this.data.name = this.data.wall.createdBy.local.name;
					}
					this.data.showResult = true;

					SessionInfoController.GetClock();
					this.$interval(() => {
						let data = SessionInfoController.GetClock();
						this.datestring = data.date;
						this.timestring = data.time;
					}, 1000);

				}, () => {
					this.data.error = 'No session found';
				});
		}


		static GetClock() {
			let tday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
			let tmonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

			let d = new Date();
			let nday = d.getDay(), nmonth = d.getMonth(), ndate = d.getDate(), nyear = d.getFullYear();
			if (nyear < 1000) {
				nyear += 1900;
			}
			let nhour = d.getHours(), nmin = d.getMinutes(), nsec = d.getSeconds(), ap, nminString, nsecString;

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

			nminString = (nmin <= 9) ? "0" + nmin : nmin;
			nsecString = (nsec <= 9) ? "0" + nsec : nsec;

			return { date: tday[nday] + ", " + tmonth[nmonth] + " " + ndate + ", " + nyear,
				time: nhour + ":" + nminString + ":" + nsecString + ap + "" }
		}
	}
}

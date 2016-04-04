/// <reference path="../../_references.ts"/>
/// <reference path="../../services/urlservice.ts"/>

module SamtavlaApp {
	"use strict";

	export class LandingController {
		static $inject = ['URLService', '$translate'];

		constructor(private urlService: IURLService, private $translate: any) {
			console.log('--> LandingController: started: ');
			this.$translate.use(this.urlService.getDomain());
		}
	}
}

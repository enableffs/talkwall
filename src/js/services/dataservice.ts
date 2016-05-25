/// <reference path="../_references.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    "use strict";
    import IRouteParamsService = angular.route.IRouteParamsService;
    import ILocationService = angular.ILocationService;

    export interface IDataService {
        checkAuthenticated(): boolean;
    }

    export class DataService implements IDataService {
        static $inject = ['$http', '$window', '$routeParams', '$location'];

        constructor (private $http: ng.IHttpService,
                    private $window: ng.IWindowService,
                    private $routeParams: IRouteParamsService,
                    private $location: ILocationService) {
            console.log('--> DataService started ...');
        }

        checkAuthenticated(): boolean {
            let tKey = 't';
            var tokenParam = this.$routeParams[tKey] || '';
            let tokenKey = 'token';
            if (tokenParam !== '') {
                console.log('--> WallController: token from parameter');
                this.$window.sessionStorage[tokenKey] = tokenParam;
                this.$location.search(tKey, null);
                return true;
            } else if (this.$window.sessionStorage[tokenKey]) {
                console.log('--> WallController: token already existing');
                return true;
            } else {
                console.log('--> WallController: not authenticated');
                this.$location.path("/");
                return false;
            }
        }
    }
}

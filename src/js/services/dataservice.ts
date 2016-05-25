/// <reference path="../_references.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    "use strict";
    import IRouteParamsService = angular.route.IRouteParamsService;
    import ILocationService = angular.ILocationService;

    export interface IDataService {
        /**
         * get authentication status
         * @return status as boolean
         */
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
            let tKey = 'authenticationToken';
            var tokenParam = this.$routeParams[tKey] || '';
            let tokenKey = 'token';
            if (tokenParam !== '') {
                //look at the route params first for 'authenticationToken'
                console.log('--> WallController: token from parameter');
                this.$window.sessionStorage[tokenKey] = tokenParam;
                this.$location.search(tKey, null);
                return true;
            } else if (this.$window.sessionStorage[tokenKey]) {
                //if not, look at the window session object
                console.log('--> WallController: token already existing');
                return true;
            } else {
                //else, not authenticated
                console.log('--> WallController: not authenticated');
                this.$location.path("/");
                return false;
            }
        }
    }
}

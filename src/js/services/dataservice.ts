/// <reference path="../_references.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    "use strict";
    import IRouteParamsService = angular.route.IRouteParamsService;
    import ILocationService = angular.ILocationService;
    import IPromise = angular.IPromise;

    export interface IDataService {
        /**
         * get authentication status
         * @return status as boolean
         */
        checkAuthenticated(): boolean;
        /**
         * get authenticated user
         * @param sFunc success callback
         * @param eFunc error callback
         */
        getUser(sFunc: (success: User) => void, eFunc: (error: {}) => void);
        /**
         * get existing wall
         * @param wallId string
         * @param sFunc success callback
         * @param eFunc error callback
         */
        getWall(wallId: string, sFunc: (success: Wall) => void, eFunc: (error: {}) => void);
    }

    export class DataService implements IDataService {
        static $inject = ['$http', '$window', '$routeParams', '$location'];
        private user: User;
        private wall: Wall;

        constructor (private $http: ng.IHttpService,
                    private $window: ng.IWindowService,
                    private $routeParams: IRouteParamsService,
                    private $location: ILocationService) {
            console.log('--> DataService started ...');
        }

        checkAuthenticated(): boolean {
            var handle = this;
            let tKey = 'authenticationToken';
            var tokenParam = this.$routeParams[tKey] || '';
            let tokenKey = 'token';
            if (tokenParam !== '') {
                //look at the route params first for 'authenticationToken'
                console.log('--> DataService: token from parameter');
                this.$window.sessionStorage[tokenKey] = tokenParam;
                //this will reload the page, clearing the token parameter. next time around it will hit the next 'else if'
                this.$location.search(tKey, null);
                return true;
            } else if (this.$window.sessionStorage[tokenKey]) {
                //look at the window session object for the token. time to load the question
                console.log('--> DataService: token already existing');
                this.getUser(
                    function(user: User) {
                        handle.user = user;
                        //get the last opened or a new wall and a pin number
                        handle.getWall(handle.user.lastOpenedWall,
                            function(wall: Wall) {
                                handle.wall = wall;
                                return true;
                            },
                            function(error: {}) {
                                //TODO: handle get wall error
                                return false;
                            }
                        );
                    },
                    function(error: {}) {
                        //TODO: handle get user error
                        return false;
                    }
                );

            } else {
                //else, not authenticated
                console.log('--> DataService: not authenticated');
                this.$location.path("/");
                return false;
            }
        }

        getUser(successCallbackFn, errorCallbackFn): void {
            //this will return the correct user from the service, based on the req.user object.
            this.$http.get('user.json')
                .success(function(data) {
                    console.log('--> DataService: getUser success');
                    successCallbackFn(data);
                })
                .catch(function(error) {
                    console.log('--> DataService: getUser failure: ' + error);
                    errorCallbackFn({status: error.status, message: error.data});
                });
        }

        getWall(wallId, successCallbackFn, errorCallbackFn): void {
            //this will return the wall from the service
            if (wallId === null) {
                //return a new wall (from service) with a new PIN
                console.log('--> DataService: getWall success: new wall generated');
                var wall = new Wall();
                wall.pin = '1234';
                successCallbackFn(wall);
            } else {
                //return the previous wall with a the existing PIN from REDIS (if expired return true)
                this.$http.get('wall.json')
                    .success(function(data) {
                        console.log('--> DataService: getWall success');
                        successCallbackFn(data);
                    })
                    .catch(function(error) {
                        console.log('--> DataService: getWall failure: ' + error);
                        errorCallbackFn({status: error.status, message: error.data});
                    });
            }
        }
    }
}

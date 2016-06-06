/// <reference path="../_references.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="utilityservice.ts"/>
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
        checkAuthenticated(sFunc: (success: Wall) => void): void;
        /**
         * get authenticated user
         * @param sFunc success callback
         * @param eFunc error callback
         */
        getUser(sFunc: (success: User) => void, eFunc: (error: {}) => void): void;
        /**
         * get last existing from services wall if any. if not get a new one
         * @param wallId string
         * @param sFunc success callback
         * @param eFunc error callback
         */
        getLastWall(wallId: string, sFunc: (success: Wall) => void, eFunc: (error: {}) => void): void;
        /**
         * get current wall
         * @return the current wall
         */
        getWall(): Wall;
        /**
         * get current question
         * @return the current question
         */
        getQuestion(): Question;
        /**
         * get current nickname
         * @return the current nickname
         */
        getNickname(): string;
        /**
         * set a question based on id
         * @param questionIndex index in the questions array
         * @param sFunc success callback
         * @param eFunc error callback
         */
        setQuestion(questionIndex: number, sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * add new question to the wall
         * @param label the question
         * @param sFunc success callback
         * @param eFunc error callback
         */
        addQuestion(label: string, sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * post new message to the feed
         * @param sFunc success callback
         * @param eFunc error callback
         */
        sendMessage(sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * delete a message from the feed
         * @param sFunc success callback
         * @param eFunc error callback
         */
        deleteMessage(sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * get the board dimensions object
         * @return the dimension object
         */
        getBoardDivSize(): {};
        /**
         * set the board dimensions object
         * @param dimensions as a JSON object
         */
        setBoardDivSize(dimensions: {}): void;
    }

    export class DataService implements IDataService {
        static $inject = ['$http', '$window', '$routeParams', '$location', 'UtilityService'];
        private user: User;
        private wall: Wall;
        private question: Question = null;
        //for dev only
        private questionStore: {} = {};
        private nickname: string = null;
        private participants: Array<string> = [];
        public messageToEdit: Message;
        private boardDivSize: {};

        constructor (private $http: ng.IHttpService,
                     private $window: ng.IWindowService,
                     private $routeParams: IRouteParamsService,
                     private $location: ILocationService,
                     private utilityService: UtilityService) {
            console.log('--> DataService started ...');
        }

        checkAuthenticated(successCallbackFn): void {
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
            } else if (this.$window.sessionStorage[tokenKey]) {
                //look at the window session object for the token. time to load the question
                console.log('--> DataService: token already existing');
                this.getUser(
                    function(user: User) {
                        handle.nickname = 'teacher';
                        handle.user = user;
                        //get the last opened or a new wall and a pin number
                        handle.getLastWall(handle.user.lastOpenedWall,
                            function(wall: Wall) {
                                handle.wall = wall;
                                successCallbackFn();
                            },
                            function(error: {}) {
                                //TODO: handle get wall error
                            }
                        );
                    },
                    function(error: {}) {
                        //TODO: handle get user error
                    }
                );
            } else {
                //else, not authenticated
                console.log('--> DataService: not authenticated');
                this.$location.path("/");
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

        getLastWall(wallId, successCallbackFn, errorCallbackFn): void {
            //return the previous wall with a the existing PIN from REDIS (if expired return true)
            //if wallId is null, return a new wall (from service) with a new PIN and an empty 'first' question
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

        getWall(): Wall {
            return this.wall;
        }

        getQuestion(): Question {
            return this.question;
        }

        getNickname(): string {
            return this.nickname;
        }

        setQuestion(questionIndex, successCallbackFn, errorCallbackFn): void {
            /*this.$http.get('question.json')
                .success(function(data) {
                    console.log('--> DataService: getQuestion success');
                    successCallbackFn(data);
                })
                .catch(function(error) {
                    console.log('--> DataService: getQuestion failure: ' + error);
                    errorCallbackFn({status: error.status, message: error.data});
                });*/
            let idKey = '_id';
            this.question = this.questionStore[this.wall.questions[questionIndex][idKey]];
            successCallbackFn();
        }

        addQuestion(label, successCallbackFn, errorCallbackFn): void {
            //generate a new question on server with _id and returns it
            // this.$http.post('question.json')
            var question = new Question();
            question._id = this.utilityService.v4();
            question.label = label;
            question.messageFeed = new Array();
            this.wall.questions.push({_id: question._id, label: question.label});
            this.questionStore[question._id] = question;
            successCallbackFn();
        }

        sendMessage(successCallbackFn, errorCallbackFn): void {
            //generate a new message on server with _id and returns it
            if (this.messageToEdit._id === undefined) {
                // this.$http.post('message.json')
                var message = new Message();
                message._id = this.utilityService.v4();
                message.creator = this.nickname;
                message.text = this.messageToEdit.text;
                message.origin = new Array();
                message.origin.push({nickname: message.creator, message_id: message._id});
                message.edits = new Array();
                message.board = {};
                message.edits.push({date: message.createdAt, text: message.text});
                //TODO: push the message received by the server instead
                this.question.messageFeed.push(message);
                successCallbackFn();
            } else {
                // this.$http.put('message.json')
                //if we get a 200 response we are happy, nothing to do
                successCallbackFn();
            }
        }

        deleteMessage(successCallbackFn, errorCallbackFn): void {
            //update message on server with _id and returns it
            // this.$http.put('message.json')
            //on response, update the feed
            /*let idKey = '_id';
            for (var i = 0; i < this.question.messageFeed.length; i++) {
                if (this.question.messageFeed[i][idKey] === message._id) {
                    this.question.messageFeed.splice(i, 1);
                    this.question.messageFeed.splice(i, 0, message);
                }
            }*/
            //if we get a 200 response we are happy, nothing to do
            successCallbackFn();
        }

        setBoardDivSize(newSize: any): void {
            console.log('--> Dataservice: setBoardDivSize: ' + angular.toJson(newSize));
            this.boardDivSize = newSize;
        }

        getBoardDivSize() {
            return this.boardDivSize;
        }
    }
}

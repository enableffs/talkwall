/// <reference path="../_references.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="utilityservice.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    "use strict";
    import IRouteParamsService = angular.route.IRouteParamsService;
    import ILocationService = angular.ILocationService;
    import IPromise = angular.IPromise;

    export interface IDataService {

        /*
         ********* authenticated (teacher only) operations *********
         app.get('/walls',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWalls);
         app.get('/wall/:id',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWall);
         app.post('/wall',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createWall);
         app.put('/wall',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateWall);
         app.post('/question',               jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createQuestion);

         ********* client (student / teacher) operations *********
         app.get('/join/:pin/:nickname',                                                                     routes.client.joinWall);
         app.get('/question/:wall_id/:question_id/:nickname',                                                routes.client.getQuestion);
         app.get('/poll/:wall_id/:question_id/:nickname',                                                    routes.client.poll);
         app.post('/message',                                                                                routes.client.createMessage);
         app.put('/message',

         */

        /**
         * check authentication status
         * @return status as boolean
         */
        userIsAuthorised(): boolean;

        /**
         * establish authentication status
         */
        checkAuthentication(sFunc: (success: {}) => void, eFunc: (error: {}) => void): void;
        /**
         * get authenticated user
         * @param sFunc success callback
         * @param eFunc error callback
         */
        requestUser(sFunc: (success: User) => void, eFunc: (error: {}) => void): void;
        /**
         * get last existing from services wall if any.
         * @param wallId string
         * @param sFunc success callback
         * @param eFunc error callback
         */
        requestWall(wallId: string, sFunc: (success: Wall) => void, eFunc: (error: {}) => void): void;
        /**
         * create a new wall
         * @param sFunc success callback
         * @param eFunc error callback
         */
        createWall(sFunc: (success: Wall) => void, eFunc: (error: {}) => void): void;
        /**
         * join a wall
         * @param sFunc success callback
         * @param eFunc error callback
         */
        joinWall(joinModel: {}, sFunc: (success: Wall) => void, eFunc: (error: {}) => void): void;
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
        requestPoll(questionIndex: number, previousQuestionIndex: number, sFunc: () => void, eFunc: (error: {}) => void): void;
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
        static $inject = ['$http', '$window', '$routeParams', '$location', 'UtilityService', 'URLService'];
        private user: User;
        private wall: Wall;
        private question: Question = null;

        //for dev only
        private studentNickname: string = null;
        private participants: Array<string> = [];
        public messageToEdit: Message;
        private boardDivSize: {};
        private userAuthorised = false;

        constructor (private $http: ng.IHttpService,
                     private $window: ng.IWindowService,
                     private $routeParams: IRouteParamsService,
                     private $location: ILocationService,
                     private utilityService: UtilityService,
                     private urlService: IURLService) {
            console.log('--> DataService started ...');
        }

        // Remove token string from the address bar. Then, if authorised, get the user model and the most recent wall
        // Otherwise, follow on back to where we came from..
        checkAuthentication(successCallbackFn, errorCallbackFn): void {
            let tKey = 'authenticationToken', tokenKey = 'token';
            var tokenParam = this.$routeParams[tKey] || '';
            if (tokenParam !== '') {
                //look at the route params first for 'authenticationToken'
                console.log('--> DataService: token from parameter');
                this.$window.sessionStorage[tokenKey] = tokenParam;
                //this will reload the page, clearing the token parameter. next time around it will hit the next 'else if'
                this.$location.search(tKey, null);
            } else if (this.$window.sessionStorage[tokenKey]) {
                this.userAuthorised = true;
                //look at the window session object for the token. time to load the question
                console.log('--> DataService: token already existing');

                this.requestUser((user: User) => {
                        if (user.lastOpenedWall === null) {
                            this.createWall(successCallbackFn, errorCallbackFn);
                        } else {
                            this.requestWall(user.lastOpenedWall, successCallbackFn, errorCallbackFn);
                        }
                    }, (error) => {
                        //TODO: handle get user error
                    }
                );
            } else {
                // Fall through..
                successCallbackFn();
            }
        }

        requestUser(successCallbackFn, errorCallbackFn): void {
            //this will return the correct user from the service, based on the req.user object.
            this.$http.get(this.urlService.getHost() + '/user')
                .success((data) => {
                    let resultKey = 'result';
                    this.user = data[resultKey];
                    console.log('--> DataService: getUser success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.user);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getUser failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }


        requestWall(wallId, successCallbackFn, errorCallbackFn): void {
            //return the previous wall with a the existing PIN from REDIS (if expired return true)
            this.$http.get(this.urlService.getHost() + '/wall')
                .success((data) => {
                    let resultKey = 'result';
                    this.wall = data[resultKey];
                    this.question = this.wall.questions[0];
                    console.log('--> DataService: getWall success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.wall);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getWall failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        createWall(successCallbackFn, errorCallbackFn): void {
            this.$http.post(this.urlService.getHost() + '/wall', {label: "New Wall: " + new Date().toDateString()})
                .success((data) => {
                    let resultKey = 'result';
                    this.wall = data[resultKey];
                    console.log('--> DataService: getWall success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.wall);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getWall failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        joinWall(joinModel, successCallbackFn, errorCallbackFn): void {
            this.$http.get(this.urlService.getHost() + '/join/' + joinModel.nickname + '/' + joinModel.pin)
                .success((data) => {
                    let resultKey = 'result';
                    this.wall = data[resultKey];
                    console.log('--> DataService: getWall success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.wall);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getWall failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        userIsAuthorised(): boolean {
            return this.userAuthorised;
        }

        getWall(): Wall {
            return this.wall;
        }

        getQuestion(): Question {
            return this.question;
        }

        getNickname(): string {
            if (this.userAuthorised) {
                return this.user.nickname;
            } else {
                return this.studentNickname;
            }
        }

        // Set previousQuestionIndex if we are changing questions. Else set it to -1
        requestPoll(questionIndex, previousQuestionIndex, successCallbackFn, errorCallbackFn): void {
            this.$http.get(this.urlService.getHost() + '/poll/' + this.getNickname() + '/' + this.wall._id +
                '/' + questionIndex + '/' + previousQuestionIndex)
                    .success((data) => {
                        let resultKey = 'result';
                        this.processUpdatedMessages(data[resultKey]);
                        if (typeof successCallbackFn === "function") {
                            successCallbackFn();
                        }
                    })
                    .catch((error) => {
                        if (typeof errorCallbackFn === "function") {
                            errorCallbackFn({status: error.status, message: error.message});
                        }
                    });
        }

        addQuestion(label, successCallbackFn, errorCallbackFn): void {
            //generate a new question on server with _id and returns it
            var question = new Question(label);
            this.$http.post(this.urlService.getHost() + '/question', question)
                .success((data) => {
                    let resultKey = 'result';
                    var newQuestion = new Question(data[resultKey].label);
                    newQuestion.createdAt = data[resultKey].createdAt;
                    newQuestion._id = data[resultKey]._id;
                    this.wall.questions.push(newQuestion);
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(newQuestion);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        sendMessage(successCallbackFn, errorCallbackFn): void {
            //generate a new message on server with _id and returns it
            if (this.messageToEdit._id === undefined) {
                // this.$http.post('message.json')
                var message = new Message();
                message._id = this.utilityService.v4();
                message.creator = this.getNickname();
                message.text = this.messageToEdit.text;
                message.origin = [];
                message.origin.push({nickname: message.creator, message_id: message._id});
                message.edits = [];
                message.board = {};
                message.edits.push({date: message.createdAt, text: message.text});
                //TODO: push the message received by the server instead
                this.question.messages.push(message);
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

        // Process each updated message sent by the poll
        processUpdatedMessages(pollUpdateObject) {
            console.log('--> processing messages');
        }
    }
}

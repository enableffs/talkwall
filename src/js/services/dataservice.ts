/// <reference path="../_references.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="utilityservice.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="../components/close/close.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    "use strict";
    import IRouteParamsService = angular.route.IRouteParamsService;
    import ILocationService = angular.ILocationService;
    import IPromise = angular.IPromise;
    import IMedia = angular.material.IMedia;

    export interface IDataService {

        /*
         ********* authenticated (teacher only) operations *********
         app.get('/walls',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWalls);
         app.get('/wall/:id',                jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.getWall);
         app.post('/wall',                   jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createWall);
         app.put('/wall',                    jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.updateWall);
         app.post('/question',               jwt({secret: secret.secretToken}),  tokenManager.verifyToken,   routes.teacher.createQuestion);

         ********* client (student / teacher) operations *********
         app.get('/clientwall/:pin/:nickname',                                                               routes.client.clientWall);
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
        getClientWall(joinModel: {}, sFunc: (success: Wall) => void, eFunc: (error: {}) => void): void;
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
        setQuestion(newQuestionIndex: number, sFunc: () => void, eFunc: (error: {}) => void): void;
        /**
         * get current nickname
         * @return the current nickname
         */
        getNickname(): string;
        /**
         * set a question based on id
         * @param sFunc success callback
         * @param eFunc error callback
         */
        requestPoll(previousQuestionId: string, control: string, sFunc: () => void, eFunc: (error: {}) => void): void;
        /**
         * add new question to the wall
         * @param label the question
         * @param sFunc success callback
         * @param eFunc error callback
         */
        addQuestion(sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * retrieve the editable question object
         */
        getQuestionToEdit(): Question;
        /**
         * set a question as the editable question object
         */
        setQuestionToEdit(question: Question);
        /**
         * post new message to the feed
         * @param sFunc success callback
         * @param eFunc error callback
         */
        addMessage(sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * update a message on the feed
         * @param sFunc success callback
         * @param eFunc error callback
         */
        updateMessage(sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * Force all connected clients to change to this question id
         */
        updateWall(status: PollUpdate, sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * update a question
         * @param sFunc success callback
         * @param eFunc error callback
         */
        updateQuestion(sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * delete a question
         * @param question to be deleted
         */
        deleteQuestion(question: Question): void;
        /**
         * get all current messages on the feed for this question
         */
        getMessages(): void;
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

        /**
         * set a message as the editable message object
         */
        setMessageToEdit(message: Message): void;
        /**
         * retrieve the editable message object
         */
        getMessageToEdit(): Message;
        /**
         * run the polling timer
         */
        startPolling(previous_question_id: string, control: string): void;
        /**
         * pause the polling timer
         */
        stopPolling(): void;


    }

    export class DataService implements IDataService {
        static $inject = ['$http', '$window', '$routeParams', '$location', '$interval', '$mdDialog', 'UtilityService',
            'URLService', '$mdMedia'];
        private user: User = null;
        private wall: Wall = null;
        private question: Question = null;
        private messageToEdit: Message = new Message();
        private questionToEdit: Question = new Question('');
        private phoneMode: boolean = false;

        private timerHandle;

        //for dev only
        private studentNickname: string = null;
        private participants: Array<string> = [];
        private mytTeachersQuestionID: string = '';
        private last_update: number = 0;
        private boardDivSize: {};
        private userAuthorised = false;
        private customFullscreen;
        private currentQuestionIndex: number = -1;


        constructor (private $http: ng.IHttpService,
                     private $window: ng.IWindowService,
                     private $routeParams: IRouteParamsService,
                     private $location: ILocationService,
                     private $interval: ng.IIntervalService,
                     private $mdDialog: angular.material.IDialogService,
                     private utilityService: UtilityService,
                     private urlService: IURLService,
                     private $mdMedia: IMedia) {
            this.customFullscreen = this.$mdMedia('xs') || this.$mdMedia('sm');
            console.log('--> DataService started ...');
        }


        // Remove token string from the address bar. Then, if authorised, get the user model and the most recent wall
        // Otherwise, follow on back to where we came from..
        checkAuthentication(successCallbackFn, errorCallbackFn): void {
            let tKey = 'authenticationToken', tokenKey = 'token';
            this.phoneMode = this.$mdMedia('max-width: 960px');
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

        // For authorised users only
        requestWall(wallId, successCallbackFn, errorCallbackFn): void {
            //return the previous wall with a the existing PIN from REDIS (if expired return true)
            this.$http.get(this.urlService.getHost() + '/wall/' + wallId)
                .success((data) => {
                    let resultKey = 'result';
                    this.wall = data[resultKey];
                    console.log('--> DataService: getWall success');
                    var question_index = this.wall.questions.length > 0 ? 0 : -1;
                    this.setQuestion(question_index, successCallbackFn, errorCallbackFn);
                })
                .catch((error) => {
                    console.log('--> DataService: getWall failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // For authorised users only
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

        // For non-authorised users
        getClientWall(joinModel, successCallbackFn, errorCallbackFn): void {
            this.$http.get(this.urlService.getHost() + '/clientwall/' + joinModel.nickname + '/' + joinModel.pin)
                .success((data) => {
                    let resultKey = 'result';
                    if (data[resultKey] === 204) {
                        this.wall.closed = true;
                        this.stopPolling();
                        this.showClosingDialog();
                    } else {
                        this.wall = data[resultKey];
                        this.studentNickname = joinModel.nickname;
                        console.log('--> DataService: getWall success');
                    }
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.wall);
                    }
                })
                .catch((error) => {
                    // Close client wall if wall was closed by teacher
                    this.wall.closed = true;
                    this.stopPolling();
                    this.showClosingDialog();
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // Accessor functions for passing messages between directives
        setMessageToEdit(message: Message) {
            this.messageToEdit = message;
        }

        getMessageToEdit(): Message {
            return this.messageToEdit;
        }

        getCurrentQuestionIndex(): number {
            return this.currentQuestionIndex;
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

        // If we are changing questions, or a new question, set the polling params correctly. Input new question index.
        setQuestion(newIndex, successCallbackFn, errorCallbackFn): void {
            var previous_question_id = 'none', control = 'none';

            // If true, we are changing questions
            if (this.question !== null && this.wall.questions.indexOf(this.question) !== newIndex) {
                previous_question_id = this.question._id;
                control = 'change';

                // If true, this is the first time we started polling on the wall
            } else if (this.question === null) {
                control = 'new';
            }

            // Now set the question if we have it available on the client.
            // If not, we will poll anyway, until notification arrives from server of teacher moving to a question
            if (newIndex !== -1) {
                this.question = this.wall.questions[newIndex];
                this.currentQuestionIndex = newIndex;
            }

            // Get the whole message list if we are 'new' or 'changing'
            // Notify a change of question if we are the teacher
            if (control !== 'none' && this.question !== null) {
                this.getMessages();
                if (this.userAuthorised) {
                    this.notifyChangedQuestion(null, null);
                }
            }

            // Start polling regardless of the question existing, to enable poll notifications
            this.stopPolling();
            this.startPolling(previous_question_id, control);

            if (typeof successCallbackFn === "function") {
                successCallbackFn(this.wall);
            }
        }

        closeWallNow(): void {
            this.wall.closed = true;
            this.updateWall(null, null);
        }

        getNickname(): string {
            if (this.userAuthorised) {
                return this.user.nickname;
            } else {
                return this.studentNickname;
            }
        }

        updateWall(successCallbackFn, errorCallbackFn): void {
            this.$http.put(this.urlService.getHost() + '/wall', {
                    wall: this.wall
                })
                .success(() => {
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        notifyChangedQuestion(successCallbackFn, errorCallbackFn): void {
            this.$http.get(this.urlService.getHost() + '/change/' + this.wall._id + '/' + this.question._id)
                .success(() => {
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: notifyChangedQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // Set previousQuestionIndex if we are changing questions. Else set it to -1
        requestPoll(previousQuestionId, control, successCallbackFn, errorCallbackFn): void {
            var question_id = 'none';
            if (this.question !== null) {
                question_id = this.question._id;
            }
            this.$http.get(this.urlService.getHost() + '/poll/' + this.getNickname() + '/' + this.wall._id +
                    '/' + question_id + '/' + previousQuestionId + '/' + control)
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

        getQuestionToEdit(): Question {
            return this.questionToEdit;
        }

        setQuestionToEdit(question: Question) {
            this.questionToEdit = question;
        }

        //generate a new question on server with _id and returns it
        addQuestion(successCallbackFn, errorCallbackFn): void {
            this.$http.post(this.urlService.getHost() + '/question', {wall_id: this.wall._id, question: this.questionToEdit})
                .success((data) => {
                    let resultKey = 'result';
                    this.wall.questions.push(data[resultKey]);
                    //this.question = question;
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        //update a new on server and return it
        updateQuestion(successCallbackFn, errorCallbackFn): void {
            if (this.questionToEdit === null) {
                errorCallbackFn({status: '400', message: "question is not defined"});
            }

            this.$http.put(this.urlService.getHost() + '/question', {
                    wall_id: this.wall._id,
                    question: this.questionToEdit
                })
                .success((data) => {
                    console.log('updating the question');
                    this.questionToEdit.showControls = false;
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: updateQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        deleteQuestion(question: Question): void {
            for (var i = 0; i < this.wall.questions.length; i++) {
                if (this.wall.questions[i]._id === question._id) {
                    this.wall.questions.splice(i, 1);
                }
            }

            //TODO: persist this to the server
        }

        //generate a new message on server with _id and returns it
        addMessage(successCallbackFn, errorCallbackFn): void {
            var nickname = this.getNickname();
            if (this.messageToEdit === null) {
                errorCallbackFn({status: '400', message: "message is not defined"});
            }
            this.messageToEdit.creator = this.getNickname();
            this.messageToEdit.origin.push({nickname: this.messageToEdit.creator, message_id: null});
            this.messageToEdit.edits.push({date: this.messageToEdit.createdAt, text: this.messageToEdit.text});
            this.messageToEdit.question_id = this.question._id;

            this.$http.post(this.urlService.getHost() + '/message', {
                    message: this.messageToEdit,
                    pin: this.wall.pin,
                    nickname: nickname
                })
                .success((data) => {
                    let resultKey = 'result';
                    this.messageToEdit.createdAt = data[resultKey].createdAt;
                    this.messageToEdit._id = data[resultKey]._id;
                    this.question.messages.push(this.messageToEdit);
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.messageToEdit);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: getQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        getMessages(): void {
            this.$http.get(this.urlService.getHost() + '/messages/' + this.question._id)
                .success((data) => {
                    let resultKey = 'result';
                    this.question.messages = data[resultKey];
                })
                .catch((error) => {
                    console.log('--> DataService: getMessages failure: ' + error);
                });
        }

        //update a new on server and return it
        updateMessage(successCallbackFn, errorCallbackFn): void {
            if (this.messageToEdit === null) {
                errorCallbackFn({status: '400', message: "message is not defined"});
            }
            this.$http.put(this.urlService.getHost() + '/message', {
                    message: this.messageToEdit,
                    pin: this.wall.pin,
                    nickname: this.getNickname()
                })
                .success((data) => {
                    let resultKey = 'result';
                    var message = data[resultKey];
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(message);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService: updateMessage failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        /*
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
         }
         //if we get a 200 response we are happy, nothing to do
         successCallbackFn();
         }
         */

        setBoardDivSize(newSize: any): void {
            console.log('--> Dataservice: setBoardDivSize: ' + angular.toJson(newSize));
            this.phoneMode = this.$mdMedia('max-width: 960px');
            this.boardDivSize = newSize;
        }

        getBoardDivSize() {
            return this.boardDivSize;
        }

        //  Run the polling timer
        // 'previous_question_id' can be 'none' if not changing questions
        // 'control' - 'none' is a regular poll, 'new' is the first poll, 'change' we are changing questions
        startPolling(previous_question_id: string, control: string) {
            // Don't allow more than one timer
            var handle = this;
            if ( angular.isDefined(this.timerHandle) ) {
                return;
            }

            // Make a special poll request without delay, then set up regular polling
            this.requestPoll(previous_question_id, control, (success) => {

                // Begin further requests at time intervals
                handle.timerHandle = handle.$interval(() => {
                    handle.requestPoll('none', 'none', null, null);
                }, 5000);

            }, null);
        }

        // Stop the polling timer
        stopPolling() {
            if (angular.isDefined(this.timerHandle)) {
                this.$interval.cancel(this.timerHandle);
                this.timerHandle = undefined;
            }
        }



        // Process updated messages retrieved on the poll response
        processUpdatedMessages(pollUpdateObject: PollUpdate) {

            // Status updates

            // Update participant list
            this.participants = pollUpdateObject.status.connected_nicknames;

            // Run on client connections only - receive status updates from teacher
            if (!this.userAuthorised && pollUpdateObject.status.last_update > this.last_update) {
                this.last_update = pollUpdateObject.status.last_update;

                // Refresh the wall
                this.getClientWall({ nickname: this.getNickname(), pin: this.wall.pin}, (success) => {

                    // Set a new question if available
                    var new_question_id = pollUpdateObject.status.teacher_question_id;
                    if (new_question_id !== 'none') {
                        var new_question_index =
                            this.utilityService.getQuestionIndexFromWallById(new_question_id, this.wall);
                        this.setQuestion(new_question_index, null, null);
                    }

                }, null);
            }

            // Message updates

            pollUpdateObject.messages.forEach((updated_message) => {
                var old_message = this.utilityService.getMessageFromQuestionById(updated_message._id, this.question);
                if ( old_message !== null) {                            // Message exists and needs to be updated
                    // this.utilityService.removeNull(updated_message);
                    angular.extend(old_message, updated_message);
                } else {                                            // Message is new and needs to be added to the list
                    this.question.messages.push(updated_message);
                }
            });
        }

        /*
         processUpdatedMessages(pollUpdateObject: PollUpdate) {

         // Status updates

         // Update participant list
         this.participants = pollUpdateObject.status.connected_nicknames;

         // Run on client connections only - receive status updates from teacher
         if (!this.userAuthorised) {
         // Change questions if directed by the teacher, or re-request the questions if updated by teacher
         // Run this check also if there is no current question
         var poll_teacher_question_id = pollUpdateObject.status.commands_to_server.teacher_question_id;
         if (poll_teacher_question_id !== this.mytTeachersQuestionID || this.currentQuestionIndex === -1) {
         var question_index = this.utilityService.getQuestionIndexFromWallById(poll_teacher_question_id, this.wall);
         if (question_index !== -1) {
         this.mytTeachersQuestionID = poll_teacher_question_id;
         this.setQuestion(question_index, null, null);
         } else {     // Teacher has created a new question the client does not have!
         // So refresh the wall and come back here to setQuestion()
         var joinModel = {
         nickname: this.getNickname(),
         pin: this.wall.pin
         };
         this.getClientWall(joinModel, null, null);
         // The polling cycle will pick up the quesiton on next cycle
         }
         }

         // Close wall if closed by teacher
         if (pollUpdateObject.status.commands_to_server.wall_closed) {
         this.stopPolling();
         this.wall.pin = '0000';
         this.wall.closed = true;
         this.showClosingDialog();
         }
         }

         // Message updates

         pollUpdateObject.messages.forEach((updated_message) => {
         var old_message = this.utilityService.getMessageFromQuestionById(updated_message._id, this.question);
         if ( old_message !== null) {                            // Message exists and needs to be updated
         // this.utilityService.removeNull(updated_message);
         angular.extend(old_message, updated_message);
         } else {                                            // Message is new and needs to be added to the list
         this.question.messages.push(updated_message);
         }
         });
         }
         */

        showClosingDialog() : void {
            //detects if the device is small
            var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
            //show the dialog
            this.$mdDialog.show({
                    controller: CloseController,
                    controllerAs: 'closeC',
                    templateUrl: 'js/components/close/close.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: true
                })
                .then(function() {
                    console.log('--> ClosingController: answered');
                }, function() {
                    //dialog dismissed
                    console.log('--> LandingController: dismissed');
                });
        }
    }
}

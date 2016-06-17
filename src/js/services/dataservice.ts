/// <reference path="../_references.ts"/>
/// <reference path="../app.constants.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="utilityservice.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="../components/close/close.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    import IAngularEvent = angular.IAngularEvent;
    "use strict";
    import IRouteParamsService = angular.route.IRouteParamsService;
    import ILocationService = angular.ILocationService;
    import IPromise = angular.IPromise;
    import IMedia = angular.material.IMedia;
    import IScope = angular.IScope;

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
         * update the current message to edit
         */
        updateMessage(): void;
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
        deleteQuestion(question: Question, sFunc: (code: number) => void, eFunc: (error: {}) => void): void;
        /**
         * get the index of the current question
         */
        getCurrentQuestionIndex(): number;
        /**
         * get all current messages on the feed for this question
         */
        getMessages(): void;
        /**
         * get array of all current participants in this question
         */
        getParticipants(): Array<string>;
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
         * get this appropriate background colour for the current question index
         */
        getBackgroundColour(): string;
        /**
         * get an object to style the grid overlay
         * @param type 'horizontal' or 'vertical'
         */
        getGridStyle(type): {};
        /**
         * set a message as the editable message object
         * @param message the message to edit
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
            'URLService', '$mdMedia', 'TalkwallConstants'];
        private user: User = null;
        private wall: Wall = null;
        private question: Question = null;
        private messageToEdit: Message;
        private questionToEdit: Question = new Question('');
        private phoneMode: boolean = false;

        private timerHandle = null;

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
                     private $mdMedia: IMedia,
                     private constants: ITalkwallConstants) {
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
                            var confirm = this.$mdDialog.confirm()
                                .title('Active wall detected!')
                                .content('You have an active wall already open. Choose an option below:')
                                .ok('Continue with existing')
                                .cancel('Create new');
                            this.$mdDialog.show(confirm).then(() => {
                                //continue
                                this.requestWall(user.lastOpenedWall, successCallbackFn, errorCallbackFn);
                            }, () => {
                                //start new and close old
                                //TODO: close wall on server first and create new one
                                this.createWall(successCallbackFn, errorCallbackFn);
                            });
                        }
                    }, (error) => {
                        //TODO: handle get user error
                    }
                );
            } else {
                // Fall through..
                this.userAuthorised = false;
                successCallbackFn();
            }

            // Set up listener for disconnect
            this.$window.onbeforeunload = function(ev: BeforeUnloadEvent): any {
                var url = this.urlService.getHost() + '/';
                this.$http.get(url + 'disconnect/' + this.getNickname() + '/' + this.wall.pin + '/' + this.question._id)
                    .then(function () {
                        this.$window.location.href = url;
                });
            };

            /*
            // Alternative method for disconnect - causes a browser dialog to show and allows time for disconnect request
            var handle = this;
            this.$window.onbeforeunload = function(ev: BeforeUnloadEvent): any {
                var x = logout();
                return x;
            };

            function logout() {
                var url = handle.urlService.getHost() +
                    '/disconnect/' + handle.getNickname() + '/' + handle.wall.pin + '/' + handle.question._id;
                handle.$window.location.href = handle.urlService.getHost() + '/';
                handle.$http.get(url).then(function() { console.log('disconnect sent'); } );
                return 'Are you sure you want to close Talkwall?';
            }
            */

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
            this.$http.get(this.urlService.getHost() + '/clientwall/' + joinModel.nickname + '/' + joinModel.pin).then(
                (success) => {
                    let resultKey = 'result', dataKey = 'data', statusKey = 'status';

                    // The wall is closed
                    if (success[statusKey] === 204) {
                        if (this.wall !== null) {
                            this.wall.closed = true;
                        }
                        this.stopPolling();
                        this.showClosingDialog();
                    } else {
                        this.wall = success[dataKey][resultKey];
                        this.studentNickname = joinModel.nickname;
                        console.log('--> DataService: getWall success');
                    }
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.wall);
                    }
                },
                (error) => {
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
            if (message === null) {
                //no message, create a new one
                this.messageToEdit = new Message();
                this.messageToEdit.creator = this.getNickname();
                this.messageToEdit.origin.push({nickname: this.messageToEdit.creator, message_id: null});
                this.messageToEdit.question_id = this.question._id;
            } else {
                this.messageToEdit = message;
                /*if (message.creator !== this.getNickname() && clone) {
                    //creator != editor, create a copy ...
                    var cloneMessage: Message = new Message();
                    cloneMessage.creator = this.getNickname();
                    cloneMessage.text = message.text;
                    cloneMessage.deleted = message.deleted;
                    cloneMessage.isSelected = message.isSelected;
                    cloneMessage.isPinned = message.isPinned;
                    //clone the array, if not it references the old messages' one ...
                    cloneMessage.origin = message.origin.slice(0);
                    cloneMessage.origin.push({nickname: this.getNickname(), message_id: message._id});
                    cloneMessage.question_id = this.question._id;
                    //copy the position if original is on the board
                    if (message.isSelected) {
                        cloneMessage.board[this.getNickname()] = message.board[this.getNickname()];
                        delete message.board[this.getNickname()];
                        this.messageToEdit = message;
                        this.updateMessage(
                            function() {
                                //success
                                handle.messageToEdit = cloneMessage;
                            },
                            function() {
                                //error
                            }
                        )
                    } else {
                        this.messageToEdit = cloneMessage;
                    }
                } else {
                    //creator = editor, do it
                    this.messageToEdit = message;
                }*/
            }
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

            //if no more questions
            if (this.wall.questions.length === 0) {
                console.log('--> setQuestion: no more questions ...');
                this.question = null;
            }

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
            if (newIndex !== -1 && this.wall.questions.length > 0) {
                this.question = this.wall.questions[newIndex];
                this.currentQuestionIndex = newIndex;
                this.questionToEdit.grid = this.question.grid;
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
            if (this.timerHandle === null) {
                this.startPolling(previous_question_id, control);
            }

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

                    // If this was the first question
                    if (this.wall.questions.length === 0) {
                        this.setQuestion(0, successCallbackFn, errorCallbackFn);
                    }
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

        deleteQuestion(question: Question, successCallbackFn, errorCallbackFn): void {
            //first check if there are existing message for that question
            this.$http.get(this.urlService.getHost() + '/messages/' + question._id)
                .success((data) => {
                    console.log('--> DataService deleteQuestion: getMessages success');
                    let resultKey = 'result';
                    if (data[resultKey].length === 0) {
                        var new_question_index = this.currentQuestionIndex;
                        var deleted_question_index = this.utilityService.getQuestionIndexFromWallById(question._id, this.wall);
                        this.wall.questions.splice(deleted_question_index, 1);
                        if (new_question_index >= deleted_question_index ) {
                            new_question_index = deleted_question_index - 1;
                        }
                        this.$http.delete(this.urlService.getHost() + '/question/' + this.wall._id + '/' + question._id)
                            .success((data) => {
                                if (new_question_index > -1) {
                                    this.setQuestion(new_question_index, null, null);
                                }
                                successCallbackFn(200);
                            })
                            .error(() => {
                                console.log('Error deleting question');
                            });
                    } else {
                        successCallbackFn(401);
                    }
                })
                .catch((error) => {
                    console.log('--> DataService deleteQuestion: getMessages failure: ' + error);
                    errorCallbackFn(error);
                });
        }

        //generate a new message on server with _id and returns it
        addMessage(successCallbackFn, errorCallbackFn): void {
            var nickname = this.getNickname();
            if (this.messageToEdit === null) {
                errorCallbackFn({status: '400', message: "message is not defined"});
            }

            this.messageToEdit.edits.push({date: new Date(), text: this.messageToEdit.text});
            this.$http.post(this.urlService.getHost() + '/message', {
                    message: this.messageToEdit,
                    pin: this.wall.pin,
                    nickname: nickname
                })
                .success((data) => {
                    let resultKey = 'result';
                    this.question.messages.push(data[resultKey]);
                    this.messageToEdit = null;
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

        getMessages(): void {
            if (this.question !== null) {
                this.$http.get(this.urlService.getHost() + '/messages/' + this.question._id)
                    .success((data) => {
                        let resultKey = 'result';
                        this.question.messages = data[resultKey];
                    })
                    .catch((error) => {
                        console.log('--> DataService: getMessages failure: ' + error);
                    });
            }
        }

        //update a new on server and return it
        updateMessage(): void {
            if (this.messageToEdit !== null) {
                this.$http.put(this.urlService.getHost() + '/message', {
                        message: this.messageToEdit,
                        pin: this.wall.pin,
                        nickname: this.getNickname()
                    })
                    .success((data) => {
                        let resultKey = 'result';
                        this.setMessageToEdit(null);
                        //update the messages array with the updated object, so that all references are in turn updated
                        let idKey = '_id';
                        for (var i = 0; i < this.question.messages.length; i++) {
                            if (this.question.messages[i][idKey] === data[resultKey][idKey]) {
                                this.question.messages.splice(i, 1);
                                this.question.messages.splice(i, 0, data[resultKey]);
                            }
                        }
                    })
                    .catch((error) => {
                        console.log('--> DataService: updateMessage failure: ' + error);
                        //TODO: fire a notification with the problem
                    });
            }
        }

        getParticipants(): Array<string> {
            return this.participants;
        }

        setBoardDivSize(newSize: any): void {
            console.log('--> Dataservice: setBoardDivSize: ' + angular.toJson(newSize));
            this.phoneMode = this.$mdMedia('max-width: 960px');
            this.boardDivSize = newSize;
        }

        getBoardDivSize() {
            return this.boardDivSize;
        }

        getBackgroundColour() {
            let bgColourKey = 'BACKGROUND_COLOURS';
            return this.constants.constants[bgColourKey][this.currentQuestionIndex];
        }

        getGridStyle(type): {} {
            let heightKey = 'VIEW_HEIGHT', widthKey = 'VIEW_WIDTH', cpColourKey = 'COMPLEMENTARY_COLOURS';
            if (type === 'horizontal') {
                return {
                    top : Math.floor(this.getBoardDivSize()[heightKey] / 2) + 'px',
                    position : 'absolute',
                    borderColor : this.constants.constants[cpColourKey][this.currentQuestionIndex],
                    backgroundColor : this.constants.constants[cpColourKey][this.currentQuestionIndex],
                    margin: 0
                };
            } else {
                return {
                    left : Math.floor(this.getBoardDivSize()[widthKey] / 2) + 'px',
                    position : 'absolute',
                    borderColor : this.constants.constants[cpColourKey][this.currentQuestionIndex],
                    backgroundColor : this.constants.constants[cpColourKey][this.currentQuestionIndex],
                    margin: 0
                };
            }
        }

        //  Run the polling timer
        // 'previous_question_id' can be 'none' if not changing questions
        // 'control' - 'none' is a regular poll, 'new' is the first poll, 'change' we are changing questions
        startPolling(previous_question_id: string, control: string) {
            var handle = this;
            function requestThePoll() {
                handle.requestPoll('none', 'none', null, null);
            }

            // Make a special poll request without delay, then set up regular polling
            this.requestPoll(previous_question_id, control, null, null);

            // Begin further requests at time intervals
            if (this.timerHandle === null) {
                this.timerHandle = this.$interval(requestThePoll, 5000);
            }

        }

        // Stop the polling timer
        stopPolling() {
            this.$interval.cancel(this.timerHandle);
            this.timerHandle = null;
        }

        // Process updated messages retrieved on the poll response
        processUpdatedMessages(pollUpdateObject: PollUpdate) {

            // Status updates

            // Update participant list
            this.participants = Object.keys(pollUpdateObject.status.connected_nicknames);

            // We should not be here! Go back to the landing page
            if (this.participants.indexOf(this.getNickname()) === -1) {
                this.$window.location.href = this.urlService.getHost() + '/';
            }

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


        showClosingDialog() : void {
            //detects if the device is small
            var useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
            var handle = this;
            //show the dialog
            this.$mdDialog.show({
                    controller: CloseController,
                    controllerAs: 'closeC',
                    templateUrl: 'js/components/close/close.html',
                    parent: angular.element(document.body),
                    clickOutsideToClose: false
                })
                .then(function(answer) {
                    console.log('--> ClosingController: answered');
                    handle.$window.location.href = handle.urlService.getHost() + '/#/';
                }, function() {
                    //dialog dismissed
                    console.log('--> LandingController: dismissed');
                });
        }
    }
}

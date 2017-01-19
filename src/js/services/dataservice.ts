/// <reference path="../_references.ts"/>
/// <reference path="../app.constants.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="authenticationservice.ts"/>
/// <reference path="utilityservice.ts"/>
/// <reference path="urlservice.ts"/>
/// <reference path="../components/close/close.ts"/>
/// <reference path="../components/archive/archive.ts"/>
/// <reference path="../models/models.ts"/>

module TalkwallApp {
    import IAngularEvent = angular.IAngularEvent;
    "use strict";
    import IRouteParamsService = angular.route.IRouteParamsService;
    import ILocationService = angular.ILocationService;
    import IPromise = angular.IPromise;
    import IMedia = angular.material.IMedia;
    import IScope = angular.IScope;
    import IRootScopeService = angular.IRootScopeService;

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
        // userIsAuthorised(): boolean;
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
         * create a log entry
         * @param type
         * @param id
         * @param diff      Change in position from the previous location
         */
        logAnEvent(type, id, diff): void;
        /**
         * get current question
         * @return the current question
         */
        // getQuestion(): Question;
        /**
         * get current nickname
         * @return the current nickname
         */
        setQuestion(newQuestionIndex: number, sFunc: () => void, eFunc: (error: {}) => void): void;
        /**
         * get current nickname
         * @return the current nickname
         */
        /// getNickname(): string;
        /**
         * set a question based on id
         * @param sFunc success callback
         * @param eFunc error callback
         */
        requestPoll(previousQuestionId: string, controlString: string, sFunc: () => void, eFunc: (error: {}) => void): void;
        /**
         * add new question to the wall
         * @param sFunc success callback
         * @param eFunc error callback
         */
        addQuestion(sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * retrieve the editable question object
         */
        /// getQuestionToEdit(): Question;
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
        updateMessages(directMessage: Array<Message>, controlString: string): void;
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
        /// getCurrentQuestionIndex(): number;
        /**
         * get all current messages on the feed for this question
         */
        getMessages(): void;
        /**
         * get array of all current participants in this question
         */
        getParticipants(): Array<string>;
        /**
         * get array of all current participants in this question
         */
        /// getContributors(): Array<string>;
        /**
         * get the board dimensions object
         * @return the dimension object
         */
        /// getBoardDivSize(): {};
        /**
         * Temporarily prevent the client from sending requests
         */
        restrictRequests(): void;
        /**
         * set the board dimensions object
         * @param dimensions as a JSON object
         */
        setBoardDivSize(dimensions: {}): void;
        /**
         * Toggle board message magnification
         */
        toggleMagnifyBoard(): void;
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
         * clear the temporary editable message object
         */
        clearMessageToEdit(): void;
        /**
         * retrieve the editable message object
         */
        getMessageToEdit(): Message;
        /**
         * run the polling timer
         */
        startPolling(previous_question_id: string, controlString: string): void;
        /**
         * pause the polling timer
         */
        stopPolling(): void;
        /**
         * set a message as the editable message object
         * @param message the message to edit
         */
        setMessageOrigin(message: Message): void;
        /**
         * retrieve the origin message object
         */
        getMessageOrigin(): Message;
        /**
         * refresh the message CSS as displayed on the board
         */
        refreshBoardMessages(): void;
        /**
         * get the wall to show in export format
         * @param wallId the wall ID string
         * @param sFunc success callback
         * @param eFunc error callback
         */
        getExportWall(wallId: string, sFunc: (success: Question) => void, eFunc: (error: {}) => void): void;
        /**
         * get the currently authenticated user object
         * @return the user
         */
        getAuthenticatedUser(): User;
        /**
         * get the state of whether the site is running on a mobie or not. The is achieved by screen size detection.
         * @return the state (true => mobile size)
         */
        /// getPhoneMode(): boolean;
        /**
         * get array of all tags found in the messages for the current question
         */
        /// getTags(): Array<string>;
        /**
         * get tag counter object
         */
        /// getTagCounter(): {};
    }

    export class DataService implements IDataService {
        static $inject = ['$http', '$window', '$routeParams', '$rootScope', '$location', '$interval', '$timeout', '$mdDialog', '$translate',
            'UtilityService', 'URLService', '$mdMedia', 'TalkwallConstants'];

        /*  New Version 3 data structure to improve binding between multiple views and this DataService */

        readonly data: {
            user: User,
            wall: Wall,
            question: Question,
            status: {
                joinedWithPin: boolean;
                authorised: boolean;
                nickname: string;
                participants: Array<string>;
                totalOnTalkwall: number,
                selectedParticipant: string;
                questionToEdit: Question;
                messageToEdit: Message;
                messageOrigin: Message;
                updateOrigin: boolean;
                currentQuestionIndex: number;
                phoneMode: boolean;
                contributors: Array<string>;
                unselected_contributors: Array<string>;
                tags: Array<string>;
                unselected_tags: Array<string>;
                tagCounter: {};
                boardDivSize: {};
                last_status_update: number;
                touchControl: boolean;
                magnifyBoard: boolean;
                restrictPositionRequests: boolean;
                restrictPositionRequestMessages: { [message_id: string ] : Message };
                idleTerminationTime: number;
            },
            log: LogEntry[]
        };

        private customFullscreen;
        private noTag = 'no tag';
        private pollingTimerHandle = null;
        private restrictTimerHandle = null;
        private logCycleCounter = 0;

        constructor (private $http: ng.IHttpService,
                     private $window: ng.IWindowService,
                     private $routeParams: IRouteParamsService,
                     private $rootScope: IRootScopeService,
                     private $location: ILocationService,
                     private $interval: ng.IIntervalService,
                     private $timeout: ng.ITimeoutService,
                     private $mdDialog: angular.material.IDialogService,
                     private $translate: angular.translate.ITranslateService,
                     private utilityService: UtilityService,
                     private urlService: IURLService,
                     private $mdMedia: IMedia,
                     private constants: ITalkwallConstants) {

            this.data = {
                user: null,
                wall: null,
                question: null,
                status: {
                    joinedWithPin: false,
                    authorised: false,
                    nickname: null,
                    participants: [],
                    totalOnTalkwall: 0,
                    selectedParticipant: null,
                    questionToEdit: null,
                    messageToEdit: null,
                    messageOrigin: null,
                    updateOrigin: false,
                    currentQuestionIndex: -1,
                    phoneMode: false,
                    contributors: [],
                    unselected_contributors: [],
                    tags: [],
                    unselected_tags: [],
                    tagCounter: {},
                    boardDivSize: {},
                    last_status_update: 0,
                    touchControl: false,
                    magnifyBoard: false,
                    restrictPositionRequests: false,
                    restrictPositionRequestMessages: {},
                    idleTerminationTime: 43200             // One year = 525600 minutes.  One month = 43200 minutes.
                },
                log: []
            };

            this.customFullscreen = this.$mdMedia('xs') || this.$mdMedia('sm');
            console.log('--> DataService started ...');

            $translate('NO_TAG').then((translation) => {
                this.noTag = translation;
            });

        }

        logAnEvent(type, id, diff) {
            let questionId = type === LogType.CreateTask ? id : this.data.question._id;
            this.data.log.push(new LogEntry(type, id, this.data.status.nickname, questionId, diff));
        }

        toggleMagnifyBoard() {
            this.data.status.magnifyBoard = !this.data.status.magnifyBoard;
        }

        restrictRequests() {
            if (this.restrictTimerHandle !== null) {
                this.$timeout.cancel(this.restrictTimerHandle);
            }
            this.data.status.restrictPositionRequests = true;
            this.restrictTimerHandle = this.$timeout(() => {
                this.data.status.restrictPositionRequests = false;
                this.sendPendingPositionUpdates();
                console.log('Sending pending position updates');
            }, 3000);
        };


        // Remove token string from the address bar. Then, if authorised, get the user model and the most recent wall
        // Otherwise, follow on back to where we came from..
        checkAuthentication(successCallbackFn, errorCallbackFn): void {
            let tKey = 'authenticationToken', tokenKey = 'token';
            this.data.status.phoneMode = this.$mdMedia('max-width: 960px');
            let tokenParam = this.$routeParams[tKey] || '';
            if (this.data.status.joinedWithPin) {
                this.$window.sessionStorage.setItem(tokenKey, '');
            }
            if (tokenParam !== '' && !this.data.status.joinedWithPin) {
                //look at the route params first for 'authenticationToken'
                console.log('--> DataService: token from parameter');
                this.$window.sessionStorage.setItem(tokenKey, tokenParam);
                //this will reload the page, clearing the token parameter. next time around it will hit the next 'else if'
                this.$location.search(tKey, null);
            } else if (this.$window.sessionStorage.getItem(tokenKey) !== '' && !this.data.status.joinedWithPin) {
                //look at the window session object for the token. time to load the question
                console.log('--> DataService: token already exists');

                this.requestUser((user: User) => {
                        this.data.status.nickname = user.nickname;
                        this.data.status.authorised = true;
                        if (user.lastOpenedWall === null) {
                            this.createWall(successCallbackFn, errorCallbackFn);

                        } else {
                            this.$mdDialog.show({
                                controller: ArchiveWallController,
                                controllerAs: 'archiveWallC',
                                templateUrl: 'js/components/archive/archive.html',
                                parent: angular.element(document.body),
                                clickOutsideToClose: true
                            }).then((answer) => {
                                //dialog answered
                                console.log('--> DataService: ArchiveWallController: answer: ' + answer);
                                if (answer === 'continue') {
                                    this.requestWall(user.lastOpenedWall, successCallbackFn, errorCallbackFn);
                                } else {
                                    this.$http.put(this.urlService.getHost() + '/wall/close/' + user.lastOpenedWall, {
                                        targetEmail: answer
                                    })
                                        .then(() => {
                                            console.log('--> DataService: close wall success');
                                            this.createWall(successCallbackFn, errorCallbackFn);
                                        }, (error) => {
                                            console.log('--> DataService: close wall failure: ' + error);
                                            if (typeof errorCallbackFn === "function") {
                                                errorCallbackFn({status: error.status, message: error.message});
                                            }
                                        })
                                }
                            }, () => {
                                //dialog dismissed
                                console.log('--> DataService: ArchiveWallController: dismissed');
                                this.$window.location.href = this.urlService.getHost() + '/#/';
                            });
                        }
                    }, () => {
                        // We are not authorised for this wall
                        this.data.status.authorised = false;
                        //TODO: handle get user error
                    }
                );
            } else {
                // Fall through..
                this.data.status.authorised = false;
                successCallbackFn();
            }

            // Set up listener for disconnect
            this.$window.onbeforeunload = () => {
                let url = this.urlService.getHost() + '/';
                let clientType = this.data.status.authorised ? 'disconnectteacher/' : 'disconnect/';
                this.$http.get(url + clientType + this.data.status.nickname + '/' + this.data.wall._id + '/' + this.data.question._id)
                    .then(function () {
                        this.$window.location.href = url;
                    });
            };

            /*
             // Alternative method for disconnect - causes a browser dialog to show and allows time for disconnect request
             let handle = this;
             this.$window.onbeforeunload = function(ev: BeforeUnloadEvent): any {
             let x = logout();
             return x;
             };

             function logout() {
             let url = handle.urlService.getHost() +
             '/disconnect/' + handle.data.status.nickname + '/' + handle.wall.pin + '/' + handle.question._id;
             handle.$window.location.href = handle.urlService.getHost() + '/';
             handle.$http.get(url).then(function() { console.log('disconnect sent'); } );
             return 'Are you sure you want to close Talkwall?';
             }
             */

        }

        getAuthenticatedUser(): User {
            return this.data.user;
        }

        requestUser(successCallbackFn, errorCallbackFn): void {
            //this will return the correct user from the service, based on the req.user object.
            this.$http.get(this.urlService.getHost() + '/user')
                .then((result) => {
                    let resultKey = 'result';
                    this.data.user = result.data[resultKey];
                    console.log('--> DataService: requestUser success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.data.user);
                    }
                }, (error) => {
                    console.log('--> DataService: requestUser failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // For authorised users only
        requestWall(wallId, successCallbackFn, errorCallbackFn): void {
            //return the previous wall with a the existing PIN from REDIS (if expired return true)
            this.$http.get(this.urlService.getHost() + '/wall/' + wallId)
                .then((result) => {
                    let resultKey = 'result';
                    this.data.wall = result.data[resultKey];
                    console.log('--> DataService: getWall success');
                    let question_index = this.data.wall.questions.length > 0 ? 0 : -1;
                    this.setQuestion(question_index, successCallbackFn, errorCallbackFn);
                }, (error) => {
                    console.log('--> DataService: requestWall failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // For authorised users only
        createWall(successCallbackFn, errorCallbackFn): void {
            this.$http.post(this.urlService.getHost() + '/wall', {label: "New Wall: " + new Date().toDateString()})
                .then((result) => {
                    let resultKey = 'result';
                    this.data.wall = result.data[resultKey];
                    console.log('--> DataService: createWall success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.data.wall);
                    }
                }, (error) => {
                    console.log('--> DataService: createWall failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // For non-authorised users
        getClientWall(joinModel, successCallbackFn, errorCallbackFn): void {
            this.$http.get(this.urlService.getHost() + '/clientwall/' + joinModel.nickname + '/' + joinModel.pin)
                .then((success) => {
                    let resultKey = 'result', dataKey = 'data', statusKey = 'status';

                    // The wall is closed
                    if (success[statusKey] === 204) {
                        if (this.data.wall !== null) {
                            this.data.wall.closed = true;
                        }
                        this.stopPolling();
                        this.showClosingDialog();
                    } else {
                        this.data.wall = success[dataKey][resultKey];
                        this.data.status.nickname = joinModel.nickname;
                        console.log('--> DataService: getClientWall success');
                    }
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.data.wall);
                    }
                }, (error) => {
                    // Close client wall if wall was closed by teacher
                    this.data.wall.closed = true;
                    this.stopPolling();
                    this.showClosingDialog();
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // Accessor functions for passing messages between directives
        setMessageToEdit(message: Message) {
            if (message === null && this.data.status.messageOrigin === null) {
                //no message, create a new one
                this.data.status.messageToEdit = new Message();
                this.data.status.messageToEdit.creator = this.data.status.nickname;
                this.data.status.messageToEdit.origin.push({nickname: this.data.status.nickname, message_id: null});
                this.data.status.messageToEdit.question_id = this.data.question._id;
            } else if (message === null && this.data.status.messageOrigin !== null) {
                //we have an origin to create the new message, clone it
                this.data.status.messageToEdit = new Message().createFromOrigin(this.data.status.messageOrigin, this.data.status.nickname);
                this.data.status.updateOrigin = typeof this.data.status.messageOrigin.board[this.data.status.nickname] !== 'undefined';
            } else {
                this.data.status.messageToEdit = message;
            }
        }

        clearMessageToEdit() {
            this.data.status.messageToEdit = null;
        }

        getMessageToEdit(): Message {
            return this.data.status.messageToEdit;
        }

        setMessageOrigin(message: Message): void {
            this.data.status.messageOrigin = message;
        }

        getMessageOrigin(): Message {
            return this.data.status.messageOrigin;
        }




        getWall(): Wall {
            return this.data.wall;
        }


        // If we are changing questions, or a new question, set the polling params correctly. Input new question index.
        setQuestion(newIndex, successCallbackFn, errorCallbackFn): void {
            let previous_question_id = 'none', control = 'none';

            this.stopPolling();

            //if no more questions
            if (this.data.wall.questions.length === 0) {
                console.log('--> setQuestion: no more questions ...');
                this.data.question = null;
            }

            // If true, we are changing questions
            if (this.data.question !== null
                && UtilityService.getQuestionIndexFromWallById(this.data.question._id, this.data.wall) !== newIndex) {

                previous_question_id = this.data.question._id;
                control = 'change';

                // If true, this is the first time we started polling on the wall
            } else if (this.data.question === null) {
                control = 'new';
            }

            // Now set the question if we have it available on the client.
            // If not, we will poll anyway, until notification arrives from server of teacher moving to a question
            if (newIndex !== -1 && this.data.wall.questions.length > 0) {
                this.data.question = new Question("").updateMe(this.data.wall.questions[newIndex]);
                this.data.status.currentQuestionIndex = newIndex;
                this.data.status.contributors = this.data.question.contributors;
                // Re-do the hashtag list
                this.buildTagArray();
            }

            // Get the whole message list if we are 'new' or 'changing'
            // Notify a change of question if we are the teacher
            if (control !== 'none' && this.data.question !== null) {
                this.getMessages();
                if (this.data.status.authorised) {
                    this.notifyChangedQuestion(this.data.question._id, previous_question_id, null, null);
                }
            }

            // Start polling regardless of the question existing, to enable poll notifications
            if (this.pollingTimerHandle === null) {
                // Make a special poll request without delay, then set up regular polling
                this.requestPoll(previous_question_id, control, null, null);
                this.startPolling();
            }

            if (typeof successCallbackFn === "function") {
                successCallbackFn(this.data.wall);
            }
        }

        closeWallNow(targetEmail): void {
            let handle = this;
            this.data.wall.closed = true;
            this.data.wall.targetEmail = targetEmail;
            this.updateWall(function() {
                handle.$window.location.href = handle.urlService.getHost() + '/#/';
            }, null);
        }

        /*
         getNickname(): string {
         return this.data.status.authorised ? this.data.user.nickname : this.data.status.studentNickname;
         }
         */

        updateWall(successCallbackFn, errorCallbackFn): void {
            this.$http.put(this.urlService.getHost() + '/wall', {
                wall: this.data.wall
            })
                .then(() => {
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                }, (error) => {
                    console.log('--> DataService: updateWall failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        notifyChangedQuestion(new_question_id, previous_question_id, successCallbackFn, errorCallbackFn): void {
            this.$http.get(this.urlService.getHost() + '/change/' + this.data.status.nickname + '/' + this.data.wall._id + '/' + new_question_id + '/' + previous_question_id)
                .then(() => {
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                }, (error) => {
                    console.log('--> DataService: notifyChangedQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        // 'previousQuestionId' to old question index if we are changing questions. Else set it to -1
        // 'question_id' - may not be set when we first enter - a request with 'none' as question_id returns only status
        // 'control' - 'none' is a regular poll, 'new' is the first poll, 'change' we are changing questions
        requestPoll(previousQuestionId, control, successCallbackFn, errorCallbackFn): void {
            let question_id = 'none', pollRoute = '/poll/';
            if (this.data.question !== null) {
                question_id = this.data.question._id;
            }
            if (this.data.status.authorised) {
                pollRoute = '/pollteacher/';
            }
            this.$http.get(this.urlService.getHost() + pollRoute + this.data.status.nickname + '/' + this.data.wall._id +
                '/' + question_id + '/' + previousQuestionId + '/' + control)
                .then((result) => {
                    let resultKey = 'result';
                    console.log('Polled at ' + UtilityService.getFormattedDate(new Date()));
                    if (result.data[resultKey] === null) {
                        console.log('The wall does not exist on server');
                        this.stopPolling();
                    } else {
                        this.processUpdatedMessages(result.data[resultKey]);
                    }
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                }, (error) => {
                    console.log('Poll FAILED at ' + Date.now().toString());
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });

            // Send logs to server
            if (this.logCycleCounter === this.constants.constants['POLLS_PER_LOG_ATTEMPT']) {
                this.logCycleCounter = 0;
                if(this.data.log.length > 0) {
                    this.$http.post(this.urlService.getHost() + '/logs/' + this.data.wall._id +
                        '/' + this.data.status.nickname, {logs: this.data.log})
                        .then(() => {
                            console.log('--> DataService: log success');
                        }, (error) => {
                            console.log('--> DataService: log failure: ' + error['message']);
                        });
                }
            } else {
                this.logCycleCounter++;
            }
        }


        setQuestionToEdit(question: Question) {
            this.data.status.questionToEdit = question;
        }

        //generate a new question on server with _id and returns it
        addQuestion(successCallbackFn, errorCallbackFn): void {
            this.$http.post(this.urlService.getHost() + '/question', {wall_id: this.data.wall._id, question: this.data.status.questionToEdit})
                .then((response) => {
                    let resultKey = 'result', firstQuestion;
                    firstQuestion = this.data.wall.questions.length === 0;
                    this.data.wall.questions.push(response.data[resultKey]);
                    this.logAnEvent(LogType.CreateTask, response.data[resultKey]._id, null);

                    // If this was the first question, set it
                    if (firstQuestion) {
                        this.setQuestion(0, successCallbackFn, errorCallbackFn);
                    }
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                }, (error) => {
                    console.log('--> DataService: addQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        updateQuestion(successCallbackFn, errorCallbackFn): void {
            if (this.data.status.questionToEdit === null) {
                errorCallbackFn({status: '400', message: "question is not defined"});
            }

            this.$http.put(this.urlService.getHost() + '/question', {
                wall_id: this.data.wall._id,
                question: this.data.status.questionToEdit
            })
                .then(() => {
                    console.log('updating the question');
                    this.logAnEvent(LogType.EditTask, this.data.status.questionToEdit._id, null);
                    if(this.data.status.questionToEdit._id === this.data.question._id) {
                        this.data.question.updateMe(this.data.status.questionToEdit);
                    }
                    this.data.status.questionToEdit.showControls = false;
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                }, (error) => {
                    console.log('--> DataService: updateQuestion failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                })
        }

        deleteQuestion(question: Question, successCallbackFn, errorCallbackFn): void {
            //first check if there are existing message for that question
            this.$http.get(this.urlService.getHost() + '/messages/' + question._id)
                .then((result) => {
                    console.log('--> DataService deleteQuestion: deleteQuestion success');
                    this.logAnEvent(LogType.DeleteTask, question._id, null);
                    let resultKey = 'result';
                    if (result.data[resultKey].length === 0) {
                        let new_question_index = this.data.status.currentQuestionIndex;
                        let deleted_question_index = UtilityService.getQuestionIndexFromWallById(question._id, this.data.wall);
                        this.data.wall.questions.splice(deleted_question_index, 1);
                        if (new_question_index >= deleted_question_index ) {
                            new_question_index = deleted_question_index - 1;
                        }
                        this.$http.delete(this.urlService.getHost() + '/question/' + this.data.wall._id + '/' + question._id)
                            .then(() => {
                                if (new_question_index > -1) {
                                    this.setQuestion(new_question_index, null, null);
                                }
                                successCallbackFn(200);
                            }, () => {
                                console.log('Error deleting question');
                            });
                    } else {
                        successCallbackFn(401);
                    }
                }, (error) => {
                    console.log('--> DataService deleteQuestion: deleteQuestion failure: ' + error);
                    errorCallbackFn(error);
                });
        }

        //generate a new message on server with _id and returns it
        addMessage(successCallbackFn, errorCallbackFn): void {
            let nickname = this.data.status.nickname;
            if (this.data.status.messageToEdit === null) {
                errorCallbackFn({status: '400', message: "message is not defined"});
            }
            this.data.status.messageToEdit.edits.push({date: new Date(), text: this.data.status.messageToEdit.text});
            if (this.data.status.updateOrigin) {
                // If the message was created from another, add it to the board, it will replace the origin message's location
                this.data.status.messageToEdit.board[this.data.status.nickname] = this.data.status.messageOrigin.board[this.data.status.nickname];
            }
            let clientType = this.data.status.authorised ? '/messageteacher' : '/message';
            this.$http.post(this.urlService.getHost() + clientType, {
                message: this.data.status.messageToEdit,
                wall_id: this.data.wall._id,
                nickname: nickname
            }).then((result) => {
                    let resultKey = 'result';
                    this.data.question.messages.push(new Message().updateMe(result.data[resultKey]));
                    this.parseMessageForTags(result.data[resultKey]);
                    this.data.status.messageToEdit = null;
                    if (this.data.status.updateOrigin) {
                        //the new cloned message was created from a message on the board, so remove my nickname from the old one
                        delete this.data.status.messageOrigin.board[this.data.status.nickname];
                        this.$http.put(this.urlService.getHost() + clientType, {
                            messages: [this.data.status.messageOrigin],
                            wall_id: this.data.wall._id,
                            nickname: this.data.status.nickname,
                            controlString: 'position'
                        })
                            .then((response) => {
                                let resultKey = 'result';
                                this.data.status.updateOrigin = false;
                                this.data.status.messageOrigin = null;
                                //update the messages array with the updated object, so that all references are in turn updated
                                let idKey = '_id';
                                this.data.question.messages.forEach((m) => {
                                    if (m._id === response.data[resultKey][idKey]) {
                                        m.updateMe(response.data[resultKey]);
                                    }
                                });
                            }, (error) => {
                                console.log('--> DataService: updateMessage failure: ' + error);
                                //TODO: fire a notification with the problem
                            });
                    } else {
                        //make sure to reset the message origin ...
                        this.data.status.messageOrigin = null;
                        this.data.status.messageToEdit = null;
                    }
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn();
                    }
                }, (error) => {
                    console.log('--> DataService: addMessage failure: ' + error);
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }

        getMessages(): void {
            if (this.data.question !== null) {
                this.$http.get(this.urlService.getHost() + '/messages/' + this.data.question._id)
                    .then((result) => {
                        this.data.question.messages = [];
                        let resultKey = 'result';
                        result.data[resultKey].forEach((m) => {
                            this.data.question.messages.push(new Message().updateMe(m));
                        });

                        this.buildTagArray();
                        this.refreshBoardMessages();
                    }, (error) => {
                        console.log('--> DataService: getMessages failure: ' + error);
                    });
            }
        }

        buildTagArray(): void {
            let handle = this;
            this.data.status.tagCounter = {};
            this.data.status.tags = [];
            this.data.question.messages.forEach(function (message: Message) {
                if (!message.deleted) {
                    handle.parseMessageForTags(message);
                }
            });
        }

        parseMessageForTags(message): void {
            if (message !== null) {
                let foundTags = this.utilityService.getPossibleTags(message.text);
                if (foundTags.length > 0) {
                    foundTags.forEach((tag) => {
                        if (this.data.status.tags.indexOf(tag) === -1) {
                            this.data.status.tags.push(tag);
                            let tid: Array<string> = [];
                            tid.push(message._id);
                            this.data.status.tagCounter[tag] = tid;
                        } else {
                            let tid: Array<string> = this.data.status.tagCounter[tag];
                            if (tid.indexOf(message._id) === -1) {
                                tid.push(message._id);
                                this.data.status.tagCounter[tag] = tid;
                            }
                        }
                    });

                    console.log('--> Dataservice: parseMessageForTags: ' + foundTags);
                } else {    // Add the message to 'no tag' item
                    if (this.data.status.tags.indexOf(this.noTag) === -1) {
                        this.data.status.tags.push(this.noTag);
                        this.data.status.tagCounter[this.noTag] = [message._id];
                    } else {
                        this.data.status.tagCounter[this.noTag].push(message._id);
                    }
                }
            }
        }

        // Convert position updates from dictionary into an array to send to server
        sendPendingPositionUpdates(): void {
            let messages = [];
            for (let message_id in this.data.status.restrictPositionRequestMessages) {
                if (this.data.status.restrictPositionRequestMessages.hasOwnProperty(message_id)) {
                    messages.push(this.data.status.restrictPositionRequestMessages[message_id]);
                }
            }
            this.data.status.restrictPositionRequestMessages = {};
            if (messages.length > 0) {
                this.updateMessages(messages, 'position');
            }
        }

        // Update messages on the server
        updateMessages(messages: Array<Message>, controlString: string): void {

            // Queue the updated message to be sent later - this saves unnecessary server polls
            if (this.data.status.restrictPositionRequests && controlString === 'position') {
                messages.forEach((message) => {
                    this.data.status.restrictPositionRequestMessages[message._id] = message;
                });
            } else {
                // Send updated messages to the server
                let clientType = this.data.status.authorised ? '/messageteacher' : '/message';
                this.$http.put(this.urlService.getHost() + clientType, {
                    messages: messages,
                    wall_id: this.data.wall._id,
                    nickname: this.data.status.selectedParticipant,
                    controlString: controlString
                })
                    .then(() => {
                        this.clearMessageToEdit();
                        console.log('--> DataService: updateMessage success');
                    }, (error) => {
                        console.log('--> DataService: updateMessage failure: ' + error);
                    });
            }

        }

        getParticipants(): Array<string> {
            return this.data.status.participants;
        }


        setBoardDivSize(newSize: any): void {
            console.log('--> Dataservice: setBoardDivSize: ' + angular.toJson(newSize));
            this.data.status.phoneMode = this.$mdMedia('max-width: 960px');
            this.data.status.boardDivSize = newSize;
        }


        getBackgroundColour() {
            let bgColourKey = 'BACKGROUND_COLOURS';
            return this.constants.constants[bgColourKey][this.data.status.currentQuestionIndex];
        }

        getGridStyle(type): {} {
            let heightKey = 'VIEW_HEIGHT', widthKey = 'VIEW_WIDTH', cpColourKey = 'COMPLEMENTARY_COLOURS';
            if (type === 'horizontal') {
                return {
                    top : Math.floor(this.data.status.boardDivSize[heightKey] / 2) + 'px',
                    position : 'absolute',
                    borderColor : this.constants.constants[cpColourKey][this.data.status.currentQuestionIndex],
                    backgroundColor : this.constants.constants[cpColourKey][this.data.status.currentQuestionIndex],
                    margin: 0
                };
            } else {
                return {
                    left : Math.floor(this.data.status.boardDivSize[widthKey] / 2) + 'px',
                    position : 'absolute',
                    borderColor : this.constants.constants[cpColourKey][this.data.status.currentQuestionIndex],
                    backgroundColor : this.constants.constants[cpColourKey][this.data.status.currentQuestionIndex],
                    margin: 0
                };
            }
        }

        //  Run the polling timer
        startPolling() {
            let handle = this;
            function requestThePoll() {
                handle.requestPoll('none', 'none', null, null);
            }

            // Begin further requests at time intervals
            if (this.pollingTimerHandle === null) {
                this.pollingTimerHandle = this.$interval(requestThePoll, this.constants.constants['POLL_INTERVAL_SECONDS'] * 1000);
            }

        }

        // Stop the polling timer
        stopPolling() {
            this.$interval.cancel(this.pollingTimerHandle);
            this.pollingTimerHandle = null;
        }

        // Process updated messages retrieved on the poll response
        processUpdatedMessages(pollUpdateObject: PollUpdate) {

            // Update participant list
            let participants = Object.keys(pollUpdateObject.status.connected_students);
            this.data.status.participants = participants.concat(Object.keys(pollUpdateObject.status.connected_teachers));
            // We should not be here! Go back to the landing page
            if (this.data.status.participants.indexOf(this.data.status.nickname) === -1) {
                this.$window.location.href = this.urlService.getHost() + '/';
            }

            // Run on teacher connections only
            if (this.data.status.authorised) {
                // Update total number of talkwall users
                this.data.status.totalOnTalkwall = pollUpdateObject.totalOnTalkwall;
                this.data.status.idleTerminationTime = pollUpdateObject.status.idleTerminationTime;
            }

            // Run on student connections only
            else {
                // Status update
                if (pollUpdateObject.status.last_update > this.data.status.last_status_update) {
                    this.data.status.last_status_update = pollUpdateObject.status.last_update;

                    // Refresh the wall
                    this.getClientWall({nickname: this.data.status.nickname, pin: this.data.wall.pin}, () => {

                        // Set a new question if available
                        let new_question_id = pollUpdateObject.status.teacher_current_question;
                        if (new_question_id !== 'none') {
                            let new_question_index = UtilityService.getQuestionIndexFromWallById(new_question_id, this.data.wall);

                            // Trigger a question and message update
                            this.data.question = null;
                            this.setQuestion(new_question_index, null, null);
                        }

                    }, null);
                }
            }

            // Check that a deleted user is removed the contributor list
            let self = this;
            function checkAndRemoveDeletedContributor(nickname) {
                let counter = 0, foundIndex = -1;
                self.data.status.contributors.forEach((user, index) => {
                    if (user === nickname) {
                        foundIndex = index;
                        counter++;
                    }
                });
                if (counter === 1) {
                    self.data.status.contributors.splice(foundIndex, 1);
                }
                counter = 0; foundIndex = -1;
                self.data.status.unselected_contributors.forEach((user, index) => {
                    if (user === nickname) {
                        foundIndex = index;
                        counter++;
                    }
                });
                if (counter === 1) {
                    self.data.status.unselected_contributors.splice(foundIndex, 1);
                }
            }

            // Message notifications (newly created messages)
            for (let message_id in pollUpdateObject.created) {
                let message = new Message().updateMe(pollUpdateObject.created[message_id]);
                this.data.question.messages.push(message);
                this.parseMessageForTags(message);

                // Check that the user is in the contributor list
                if(this.data.status.contributors.indexOf(message.creator) === -1) {
                    this.data.status.contributors.push(message.creator);
                }
            }

            // Message notifications (updated messages)
            for (let message_id in pollUpdateObject.updated) {
                let update = pollUpdateObject.updated[message_id];
                let message = this.utilityService.getMessageFromQuestionById(message_id, this.data.question);
                if ( message !== null) {

                    switch(pollUpdateObject.updated[message_id].updateType) {

                        case 'edit':
                            message.text = update.text;
                            message.deleted = update.deleted;
                            if (message.deleted) {
                                checkAndRemoveDeletedContributor(message.creator);
                            }

                            break;

                        case 'position':
                            message.updateBoard(update.board, true, this.data.status.nickname);
                            break;

                        case 'mixed':
                            message.text = update.text;
                            message.deleted = update.deleted;
                            if (message.deleted) {
                                checkAndRemoveDeletedContributor(message.creator);
                            }
                            message.updateBoard(update.board, true, this.data.status.nickname);
                            break;
                    }

                }

                this.parseMessageForTags(message);
                this.refreshBoardMessages();
            }
        }

        refreshBoardMessages(): void {
            this.$rootScope.$broadcast('talkwallMessageUpdate', this.data.status.selectedParticipant);
        }

        showClosingDialog() : void {
            //detects if the device is small
            // let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;

            let self = this;
            let disconnect = function() {
                let url = self.urlService.getHost() + '/#/';
                self.$http.get(url + 'disconnect/' + self.data.status.nickname + '/' + self.data.wall._id + '/' + self.data.question._id)
                    .then(() => {
                        self.$window.location.href = url;
                    }, () => {
                        self.$window.location.href = url;
                    });
            };

            //show the dialog
            this.$mdDialog.show({
                controller: CloseController,
                controllerAs: 'closeC',
                templateUrl: 'js/components/close/close.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false
            })
                .then(function() {
                    console.log('--> ClosingController: answered');
                    disconnect();
                }, function() {
                    //dialog dismissed
                    console.log('--> LandingController: dismissed');
                    disconnect();
                });
        }

        getExportWall(wallId, successCallbackFn, errorCallbackFn): void {
            this.$http.get(this.urlService.getHost() + '/export/' + wallId).then(
                (success) => {
                    let resultKey = 'result', dataKey = 'data'; // statusKey = 'status';
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(success[dataKey][resultKey]);
                    }
                },
                (error) => {
                    // Close client wall if wall was closed by teacher
                    if (typeof errorCallbackFn === "function") {
                        errorCallbackFn({status: error.status, message: error.message});
                    }
                });
        }
    }
}

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
        requestPoll(previousQuestionId: string, control: string, sFunc: () => void, eFunc: (error: {}) => void): void;
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
        updateMessage(directMessage: Message): void;
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
        startPolling(previous_question_id: string, control: string): void;
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
        static $inject = ['$http', '$window', '$routeParams', '$location', '$interval', '$mdDialog', '$translate',
            'UtilityService', 'URLService', '$mdMedia', 'TalkwallConstants'];

        private timerHandle = null;

        /*  New Version 3 data structure to improve binding between multiple views and this DataService */

        readonly data: {
            user: User,
            wall: Wall,
            question: Question,
            status: {
                authorised: boolean;
                nickname: string;
                participants: Array<string>;
                questionToEdit: Question,
                messageToEdit: Message,
                messageOrigin: Message,
                updateOrigin: boolean,
                currentQuestionIndex: number,
                phoneMode: boolean,
                contributors: Array<string>,
                tags: Array<string>,
                tagCounter: {},
                boardDivSize: {},
                last_update: number
            }
        };




        private customFullscreen;
        private noTag = 'no tag';

        constructor (private $http: ng.IHttpService,
                     private $window: ng.IWindowService,
                     private $routeParams: IRouteParamsService,
                     private $location: ILocationService,
                     private $interval: ng.IIntervalService,
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
                    authorised: false,
                    nickname: null,
                    participants: [],
                    questionToEdit: new Question(''),
                    messageToEdit: null,
                    messageOrigin: null,
                    updateOrigin: false,
                    currentQuestionIndex: -1,
                    phoneMode: false,
                    contributors: [],
                    tags: [],
                    tagCounter: {},
                    boardDivSize: {},
                    last_update: 0
                }
            };


            this.customFullscreen = this.$mdMedia('xs') || this.$mdMedia('sm');
            console.log('--> DataService started ...');

            $translate('NO_TAG').then((translation) => {
                this.noTag = translation;
            });
        }


        // Remove token string from the address bar. Then, if authorised, get the user model and the most recent wall
        // Otherwise, follow on back to where we came from..
        checkAuthentication(successCallbackFn, errorCallbackFn): void {
            let tKey = 'authenticationToken', tokenKey = 'token';
            this.data.status.phoneMode = this.$mdMedia('max-width: 960px');
            let tokenParam = this.$routeParams[tKey] || '';
            if (tokenParam !== '') {
                //look at the route params first for 'authenticationToken'
                console.log('--> DataService: token from parameter');
                this.$window.sessionStorage[tokenKey] = tokenParam;
                //this will reload the page, clearing the token parameter. next time around it will hit the next 'else if'
                this.$location.search(tKey, null);
            } else if (this.$window.sessionStorage[tokenKey]) {
                this.data.status.authorised = true;
                //look at the window session object for the token. time to load the question
                console.log('--> DataService: token already existing');

                this.requestUser((user: User) => {
                        this.data.status.nickname = user.nickname;
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
                                        .success(() => {
                                            console.log('--> DataService: close wall success');
                                            this.createWall(successCallbackFn, errorCallbackFn);
                                        })
                                        .catch((error) => {
                                            console.log('--> DataService: close wall failure: ' + error);
                                            if (typeof errorCallbackFn === "function") {
                                                errorCallbackFn({status: error.status, message: error.message});
                                            }
                                        });
                                }
                            }, () => {
                                //dialog dismissed
                                console.log('--> DataService: ArchiveWallController: dismissed');
                                this.$window.location.href = this.urlService.getHost() + '/#/';
                            });
                        }
                    }, () => {
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
                this.$http.get(url + 'disconnect/' + this.data.status.nickname + '/' + this.data.wall.pin + '/' + this.data.question._id)
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
                .success((data) => {
                    let resultKey = 'result';
                    this.data.user = data[resultKey];
                    console.log('--> DataService: getUser success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.data.user);
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
                    this.data.wall = data[resultKey];
                    console.log('--> DataService: getWall success');
                    let question_index = this.data.wall.questions.length > 0 ? 0 : -1;
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
                    this.data.wall = data[resultKey];
                    console.log('--> DataService: getWall success');
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.data.wall);
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
                        if (this.data.wall !== null) {
                            this.data.wall.closed = true;
                        }
                        this.stopPolling();
                        this.showClosingDialog();
                    } else {
                        this.data.wall = success[dataKey][resultKey];
                        this.data.status.nickname = joinModel.nickname;
                        console.log('--> DataService: getWall success');
                    }
                    if (typeof successCallbackFn === "function") {
                        successCallbackFn(this.data.wall);
                    }
                },
                (error) => {
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
                this.data.status.messageToEdit.origin.push({nickname: this.data.status.messageToEdit.creator, message_id: null});
                this.data.status.messageToEdit.question_id = this.data.question._id;
            } else if (message === null && this.data.status.messageOrigin !== null) {
                //we have an origin to create the new message, clone it
                this.data.status.messageToEdit = JSON.parse(JSON.stringify(this.data.status.messageOrigin));
                this.data.status.messageToEdit.creator = this.data.status.nickname;
                this.data.status.messageToEdit.origin.push({nickname: this.data.status.messageToEdit.creator, message_id: this.data.status.messageOrigin._id});
                //remove the _id of the old one
                this.data.status.messageToEdit._id = undefined;
                this.data.status.messageToEdit.board = {};
                this.data.status.updateOrigin = false;
                if (this.data.status.messageOrigin.board[this.data.status.nickname] !== undefined) {
                    this.data.status.messageToEdit.edits = [];
                    this.data.status.messageToEdit.board[this.data.status.nickname] = JSON.parse(JSON.stringify(this.data.status.messageOrigin.board[this.data.status.nickname]));
                    this.data.status.updateOrigin = true;
                }
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
            if (this.data.question !== null && this.data.wall.questions.indexOf(this.data.question) !== newIndex) {
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
                console.log('--> new bgcolor available: ' + this.getBackgroundColour());
                this.data.status.questionToEdit.grid = this.data.question.grid;
                //retrieve participants list
                this.data.status.participants = this.data.question.participants;
                // Re-do the hashtag list
                this.buildTagArray();
            }

            // Get the whole message list if we are 'new' or 'changing'
            // Notify a change of question if we are the teacher
            if (control !== 'none' && this.data.question !== null) {
                this.getMessages();
                if (this.data.status.authorised) {
                    this.notifyChangedQuestion(null, null);
                }
            }

            // Start polling regardless of the question existing, to enable poll notifications
            if (this.timerHandle === null) {
                this.startPolling(previous_question_id, control);
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
            this.$http.get(this.urlService.getHost() + '/change/' + this.data.status.nickname + '/' + this.data.wall._id + '/' + this.data.question._id)
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
            let question_id = 'none', pollRoute = '/poll/';
            if (this.data.question !== null) {
                question_id = this.data.question._id;
            }
            if (this.data.status.authorised) {
                pollRoute = '/pollteacher/';
            }
            this.$http.get(this.urlService.getHost() + pollRoute + this.data.status.nickname + '/' + this.data.wall._id +
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


        setQuestionToEdit(question: Question) {
            this.data.status.questionToEdit = question;
        }

        //generate a new question on server with _id and returns it
        addQuestion(successCallbackFn, errorCallbackFn): void {
            this.$http.post(this.urlService.getHost() + '/question', {wall_id: this.data.wall._id, question: this.data.status.questionToEdit})
                .success((data) => {
                    let resultKey = 'result';
                    this.data.wall.questions.push(data[resultKey]);

                    // If this was the first question
                    if (this.data.wall.questions.length === 0) {
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
            if (this.data.status.questionToEdit === null) {
                errorCallbackFn({status: '400', message: "question is not defined"});
            }

            this.$http.put(this.urlService.getHost() + '/question', {
                wall_id: this.data.wall._id,
                question: this.data.status.questionToEdit
            })
                .success(() => {
                    console.log('updating the question');
                    this.data.status.questionToEdit.showControls = false;
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
                        let new_question_index = this.data.status.currentQuestionIndex;
                        let deleted_question_index = this.utilityService.getQuestionIndexFromWallById(question._id, this.data.wall);
                        this.data.wall.questions.splice(deleted_question_index, 1);
                        if (new_question_index >= deleted_question_index ) {
                            new_question_index = deleted_question_index - 1;
                        }
                        this.$http.delete(this.urlService.getHost() + '/question/' + this.data.wall._id + '/' + question._id)
                            .success(() => {
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
            let nickname = this.data.status.nickname;
            if (this.data.status.messageToEdit === null) {
                errorCallbackFn({status: '400', message: "message is not defined"});
            }

            this.data.status.messageToEdit.edits.push({date: new Date(), text: this.data.status.messageToEdit.text});
            this.$http.post(this.urlService.getHost() + '/message', {
                message: this.data.status.messageToEdit,
                pin: this.data.wall.pin,
                nickname: nickname
            })
                .success((data) => {
                    let resultKey = 'result';
                    this.data.question.messages.push(new Message().updateMe(data[resultKey]));
                    this.parseMessageForTags(data[resultKey]);
                    this.data.status.messageToEdit = null;
                    if (this.data.status.updateOrigin) {
                        //the new cloned message has been posted, remove the nickname from the old one
                        delete this.data.status.messageOrigin.board[this.data.status.nickname];
                        //update the orgin message, so it will be removed from the board from the current user
                        this.$http.put(this.urlService.getHost() + '/message', {
                            message: this.data.status.messageOrigin,
                            pin: this.data.wall.pin,
                            nickname: this.data.status.nickname
                        })
                            .success((data) => {
                                let resultKey = 'result';
                                this.setMessageToEdit(null);
                                this.data.status.updateOrigin = false;
                                if (this.data.status.messageOrigin !== null) {
                                    this.data.status.messageOrigin = null;
                                }
                                //update the messages array with the updated object, so that all references are in turn updated
                                let idKey = '_id';
                                this.data.question.messages.forEach((m) => {
                                    if (m._id === data[resultKey][idKey]) {
                                        m.updateMe(data[resultKey]);
                                    }
                                });
                            })
                            .catch((error) => {
                                console.log('--> DataService: updateMessage failure: ' + error);
                                //TODO: fire a notification with the problem
                            });
                    } else {
                        //make sure to reset the message origin ...
                        this.data.status.messageOrigin = null;
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

        getMessages(): void {
            if (this.data.question !== null) {
                this.$http.get(this.urlService.getHost() + '/messages/' + this.data.question._id)
                    .success((data) => {
                        this.data.question.messages = [];
                        let resultKey = 'result';
                        data[resultKey].forEach((m) => {
                            this.data.question.messages.push(new Message().updateMe(m));
                        });

                        this.buildTagArray();
                    })
                    .catch((error) => {
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
                if (foundTags !== null) {
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

        //update message on server and return it
        updateMessage(directMessage): void {
            let message = null;

            if(typeof directMessage !== 'undefined' && directMessage !== null) {
                message = directMessage;
            } else {
                message = this.data.status.messageToEdit;
                this.clearMessageToEdit();
            }

            if (message !== null) {
                this.$http.put(this.urlService.getHost() + '/message', {
                    message: message,
                    pin: this.data.wall.pin,
                    nickname: this.data.status.nickname
                })
                    .then((data) => {
                        let resultKey = 'result'; let idKey = '_id';
                        //update the messages array with the updated object, so that all references are in turn updated
                        this.data.question.messages.forEach((m: Message) => {
                            if (m._id === data.data[resultKey][idKey]) {
                                m.updateMe(data.data[resultKey]);
                                this.parseMessageForTags(data.data[resultKey]);
                            }
                        })
                    }, (error) => {
                        console.log('--> DataService: updateMessage failure: ' + error);
                        this.data.status.messageToEdit = message;
                        //TODO: fire a notification with the problem
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
        // 'previous_question_id' can be 'none' if not changing questions
        // 'control' - 'none' is a regular poll, 'new' is the first poll, 'change' we are changing questions
        startPolling(previous_question_id: string, control: string) {
            let handle = this;
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

            // Update participant list
            this.data.status.participants = Object.keys(pollUpdateObject.status.connected_nicknames);
            // We should not be here! Go back to the landing page
            if (this.data.status.participants.indexOf(this.data.status.nickname) === -1) {
                this.$window.location.href = this.urlService.getHost() + '/';
            } else {
                //see whether a participant list refresh is needed
                if (this.data.status.authorised) {
                    let refreshNeeded: boolean = false;
                    for (let i = 0; i < this.data.status.participants.length; i++) {
                        if (this.data.status.participants.indexOf(this.data.status.participants[i]) === -1) {
                            //new participant found!
                            refreshNeeded = true;
                            break;
                        }
                    }

                    if (refreshNeeded && this.data.wall !== null && this.data.question !== null) {
                        this.$http.get(this.urlService.getHost() + '/wall/' +
                            this.data.wall._id + '/question/' +
                            this.data.question._id + '/contributors')
                            .success((data) => {
                                console.log('--> Dataservice: retrievd question particpants success');
                                let resultKey = 'result';
                                this.data.status.participants = data[resultKey];
                            })
                            .catch((error) => {
                                console.log('--> Dataservice: retrievd question particpants success: ' + error);
                            });
                    }
                }
            }

            // Run on client connections only - receive status updates from teacher
            if (!this.data.status.authorised && pollUpdateObject.status.last_update > this.data.status.last_update) {
                this.data.status.last_update = pollUpdateObject.status.last_update;

                // Refresh the wall
                this.getClientWall({ nickname: this.data.status.nickname, pin: this.data.wall.pin}, () => {

                    // Set a new question if available
                    let new_question_id = pollUpdateObject.status.teacher_question_id;
                    if (new_question_id !== 'none') {
                        let new_question_index =
                            this.utilityService.getQuestionIndexFromWallById(new_question_id, this.data.wall);
                        this.setQuestion(new_question_index, null, null);
                    }

                }, null);
            }

            // Message updates


            pollUpdateObject.messages.forEach((updated_message) => {
                let old_message = this.utilityService.getMessageFromQuestionById(updated_message._id, this.data.question);
                if ( old_message !== null) {
                    // Message exists and needs to be updated
                    old_message.updateMe(updated_message);
                } else {
                    // Message is new and needs to be added to the list
                    this.data.question.messages.push(new Message().updateMe(updated_message));
                }
                this.parseMessageForTags(updated_message);
            });
        }


        showClosingDialog() : void {
            //detects if the device is small
            // let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
            let handle = this;
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
                    handle.$window.location.href = handle.urlService.getHost() + '/#/';
                }, function() {
                    //dialog dismissed
                    console.log('--> LandingController: dismissed');
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

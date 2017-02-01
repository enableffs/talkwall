/*
 Copyright 2016, 2017 Richard Nesnass and Jeremy Toussaint

 This file is part of Talkwall.

 Talkwall is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Talkwall is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Talkwall.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
import IAngularEvent = angular.IAngularEvent;
import IRouteParamsService = angular.route.IRouteParamsService;
import ILocationService = angular.ILocationService;
import IPromise = angular.IPromise;
import IMedia = angular.material.IMedia;
import IScope = angular.IScope;
import IRootScopeService = angular.IRootScopeService;
import * as models from "../models/models";
import {TalkwallConstants} from "../app.constants";
import {UtilityService} from "./utilityservice";
import {URLService} from "./urlservice";
import {CloseController} from "../components/close/close";
import {LogType} from "../models/models";
import IToastService = angular.material.IToastService;

export interface IDataService {
    /**
     * establish authentication status
     */
    checkAuthentication(sFunc: (success: {}) => void, eFunc: (error: {}) => void): void;
    /**
     * get authenticated user
     * @param sFunc success callback
     * @param eFunc error callback
     */
    requestUser(sFunc: (success: models.User) => void, eFunc: (error: {}) => void): void;
    /**
     *
     * @param user
     * @param sFunc
     * @param eFunc
     */
    updateUser(user: models.User, sFunc: (success: models.User) => void, eFunc: (error: {}) => void): void;
    /**
     * check if a user exists on Talkwall by email address
     * @param email email address
     * @param sFunc success callback
     * @param eFunc error callback
     */
    userExists(email: string, sFunc: () => void, eFunc: () => void): void;
    /**
     * get list of a user's walls where it is an organiser.
     * @param sFunc success callback
     * @param eFunc error callback
     */
    requestWalls(sFunc: (success: models.Wall[]) => void, eFunc: (error: {}) => void): void;
    /**
     * get list of a user's logs where it is an organiser.
     * @param sFunc success callback
     * @param eFunc error callback
     */
    requestLogs(wall_id: string, startDateTime: number, endDateTime: number, timelineTime: number, selectedTypes: string, sFunc: (success: models.Wall[]) => void, eFunc: (error: {}) => void): void;
    /**
     * get wall by wall_id (requires authorisation).
     * @param wall_id string
     * @param sFunc success callback
     * @param eFunc error callback
     */
    requestWall(wall_id: string, sFunc: (success: models.Wall) => void, eFunc: (error: {}) => void): void;
    /**
     * get wall by wall_id (non-authorised).
     * @param wall_id string
     * @param sFunc success callback
     * @param eFunc error callback
     */
    requestWallUnauthorised(wall_id: string, sFunc: (success: models.Wall) => void, eFunc: (error: {}) => void): void;
    /**
     * create a new wall
     * @param newWall data object
     * @param sFunc success callback
     * @param eFunc error callback
     */
    createWall(newWall: {}, sFunc: (success: models.Wall) => void, eFunc: (error: {}) => void): void;
    /**
     * join a wall
     * @param sFunc success callback
     * @param eFunc error callback
     */
    connectClientWall(joinModel: {}, sFunc: (success: models.Wall) => void, eFunc: (error: {}) => void): void;
    /**
     * create a log entry
     * @param type
     * @param id
     * @param diff      Change in position from the previous location
     */
    logAnEvent(type: LogType, id: string, diff: {x: number, y: number}, text: string, basedOn: {}, basedOnText: string): void;
    /**
     * get current nickname
     * @return the current nickname
     */
    setQuestion(newQuestionIndex: number, sFunc: () => void, eFunc: (error: {}) => void): void;
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
    addQuestion(sFunc: (success: models.Question) => void, eFunc: (error: {}) => void): void;
    /**
     * set a question as the editable question object
     */
    setQuestionToEdit(question: models.Question): void;
    /**
     * post new message to the feed
     * @param sFunc success callback
     * @param eFunc error callback
     */
    addMessage(sFunc: (success: models.Question) => void, eFunc: (error: {}) => void): void;
    /**
     * update the current message to edit
     */
    updateMessages(directMessage: Array<models.Message>, controlString: string): void;
    /**
     * update a wall's details
     * @param wall
     * @param successCallbackFn
     * @param errorCallbackFn
     */
    updateWall(wall: models.Wall, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void;
    /**
     * update a question
     * @param sFunc success callback
     * @param eFunc error callback
     */
    updateQuestion(sFunc: (success: models.Question) => void, eFunc: (error: {}) => void): void;
    /**
     * delete a question
     * @param question to be deleted
     */
    deleteQuestion(question: models.Question, sFunc: (code: number) => void, eFunc: (error: {}) => void): void;
    /**
     * get all current messages on the feed for this question
     */
    getMessages(sFunc: (code: number) => void, eFunc: (error: {}) => void): void;
    /**
     * get array of all current participants in this question
     */
    getParticipants(): Array<string>;
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
    getGridStyle(type: string): {};
    /**
     * clear the temporary editable message object
     */
    clearMessageToEdit(): void;
    /**
     * run the polling timer
     */
    startPolling(previous_question_id: string, controlString: string): void;
    /**
     * pause the polling timer
     */
    stopPolling(): void;
    /**
     * refresh the message CSS as displayed on the board
     */
    refreshBoardMessages(): void;
    /**
     * show a toast pop up with text as message
     * @param text
     */
    showToast(text: string): void;
    /**
     * get the wall to show in export format
     * @param wallId the wall ID string
     * @param sFunc success callback
     * @param eFunc error callback
     */
    getExportWall(wallId: string, sFunc: (success: models.Question) => void, eFunc: (error: {}) => void): void;
    /**
     * get the currently authenticated user object
     * @return the user
     */
    getAuthenticatedUser(): models.User;
    /**
     *
     * @param successCallbackFn
     * @param errorCallbackFn
     */
    disconnectFromWall(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void
}

let constants = TalkwallConstants.Constants;

export class DataService implements IDataService {
    static $inject = ['$http', '$window', '$routeParams', '$rootScope', '$location', '$interval', '$timeout', '$mdDialog', '$translate',
        'UtilityService', 'URLService', '$mdMedia', '$mdToast'];

    /*  New Version 3 data structure to improve binding between multiple views and this DataService */

    readonly data: {
        user: models.User,
        wall: models.Wall,
        question: models.Question,
        status: {
            joinedWithPin: boolean;
            authorised: boolean;
            participants: Array<string>;
            totalOnTalkwall: number,
            selectedParticipant: string;
            questionToEdit: models.Question;
            messageToEdit: models.Message;
            messageOrigin: models.Message;
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
            restrictPositionRequestMessages: { [message_id: string ] : models.Message };
            idleTerminationTime: number;
        },
        log: models.LogEntry[]
    };

    private customFullscreen: boolean;
    private noTag: string = 'no tag';
    private pollingTimerHandle: any = null;
    private restrictTimerHandle: any = null;
    private logCycleCounter: number = 0;

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
                 private urlService: URLService,
                 private $mdMedia: IMedia,
                 private $mdToast: IToastService) {

        this.data = {
            user: null,
            wall: null,
            question: null,
            status: {
                joinedWithPin: false,
                authorised: false,
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

    showToast(text: string): void {
        this.$mdToast.show(this.$mdToast.simple().textContent(text).hideDelay(2000));
    }

    logAnEvent(type: LogType, id: string, diff: {x: number, y: number}, text: string, origin: {}[], basedOnText: string) {
        /*
        if(!this.data.wall.trackLogs) {
            return;
        }
        */
        // In cases where we record a question event, the itemid will match the q_id
        let questionId = type === models.LogType.CreateTask ? id : this.data.question._id;
        let basedOn: {itemid: string, nick: string, text: string} = null;
        if (origin !== null && origin.length > 0) {
            basedOn = { itemid: origin[0]['message_id'], nick: origin[0]['nickname'], text: basedOnText }
        }
        this.data.log.push(new models.LogEntry(type, id, this.data.user.nickname, text, questionId, diff, basedOn));
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
    checkAuthentication(successCallbackFn: () => void, errorCallbackFn: () => void): void {
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
            this.requestUser(() => {
                    this.data.status.authorised = true;
                    if (successCallbackFn) {
                        successCallbackFn();
                    }
                }, () => {
                    // We are not authorised for this wall
                    this.data.status.authorised = false;
                    if(errorCallbackFn) {
                        errorCallbackFn();
                    }
                }
            );
        } else {
            // Fall through..
            this.data.status.authorised = false;
            successCallbackFn();
        }



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

    getAuthenticatedUser(): models.User {
        return this.data.user;
    }

    requestUser(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
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

    userExists(email: string, sFunc: (result: boolean) => void, eFunc: () => void): void {
        this.$http.get(this.urlService.getHost() + '/userexists/' + email)
            .then((result) => {
                sFunc(result['data']['exists']);
            }, () => {
                eFunc();
            });
    }

    updateUser(user: models.User, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        if (user === null) {
            user = this.data.user;
        }
        this.$http.put(this.urlService.getHost() + '/user', {
            user: user
        })
            .then((response) => {
                if (typeof successCallbackFn === "function") {
                    successCallbackFn(response['data']['result']);
                }
            }, (error) => {
                console.log('--> DataService: updateUser failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    // For authorised users only
    requestWall(wallId: string, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        //return the previous wall with a the existing PIN from REDIS (if expired return true)
        this.$http.get(this.urlService.getHost() + '/wall/' + wallId)
            .then((result) => {
                let resultKey = 'result';
                this.data.wall = result.data[resultKey];
                console.log('--> DataService: getWall success');
                successCallbackFn(null);
            }, (error) => {
                console.log('--> DataService: requestWall failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    // For non-authorised users
    requestWallUnauthorised(wall_id: string, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        //return the previous wall with a the existing PIN from REDIS (if expired return true)
        this.$http.get(this.urlService.getHost() + '/clientwall/' + wall_id)
            .then((result) => {
                this.data.wall = result.data['result'];
                console.log('--> DataService: getWall success');
                successCallbackFn(null);
            }, (error) => {
                console.log('--> DataService: requestWall failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    // For authorised users only
    requestWalls(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        this.$http.get(this.urlService.getHost() + '/walls')
            .then((result) => {
                let resultKey = 'result';
                console.log('--> DataService: getWalls success');
                successCallbackFn(result.data[resultKey]);
            }, (error) => {
                console.log('--> DataService: requestWalls failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    // For authorised users only
    createWall(newWall: {}, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        this.$http.post(this.urlService.getHost() + '/wall', {label: newWall['label'], theme: newWall['theme']})
            .then((result) => {
                let resultKey = 'result';
                console.log('--> DataService: createWall success');
                if (typeof successCallbackFn === "function") {
                    successCallbackFn(result.data[resultKey]);
                }
            }, (error) => {
                console.log('--> DataService: createWall failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    // For authorised users only
    requestLogs(wall_id: string, startDateTime: number, endDateTime: number, timelineTime: number, selectedTypes: string, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        let url = this.urlService.getHost() + '/logs/' + wall_id + '/' + startDateTime + '/' + endDateTime + '/' + timelineTime + '/' + selectedTypes;
        //this.$location.url(url);
        //successCallbackFn(null);
        this.$http.post(url, {}, {responseType: 'arraybuffer'})
            .then((response) => {
                let headers = response.headers();
                let blob = new Blob([response.data],{type:headers['content-type']});
                let link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = "talkwall-logs-" + startDateTime + '-' + endDateTime;
                link.click();
        }, (error) => {
            console.log('Get logs error' + error);
        })
    }

    // For non-authorised users
    connectClientWall(joinModel: any, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        let resultKey = 'result', dataKey = 'data', statusKey = 'status', messageKey = 'message';
        this.$http.get(this.urlService.getHost() + '/clientwall/' + joinModel.nickname + '/' + joinModel.pin)
            .then((success) => {


                // The wall is closed or PIN not found or nickname is in use
                if (success[statusKey] === 204) {
                    if (this.data.wall !== null && !this.data.wall.closed) {
                        this.data.wall.closed = true;
                        this.stopPolling();
                        this.showClosingDialog();
                    } else {
                        let messageTitle = this.$translate.instant('MENUPAGE_PIN_NOT_FOUND_TITLE');
                        let messageText = this.$translate.instant('MENUPAGE_PIN_NOT_FOUND');
                        this.$mdDialog.show(
                            this.$mdDialog.alert()
                                .clickOutsideToClose(true)
                                .title(messageTitle)
                                .textContent(messageText)
                                .ok('OK')
                        );
                    }
                } else {
                    this.data.wall = success[dataKey][resultKey];
                    this.data.user = new models.User();
                    this.data.user.nickname = joinModel.nickname;
                    console.log('--> DataService: getClientWall success');
                }
                if (typeof successCallbackFn === "function") {
                    successCallbackFn(this.data.wall);
                }
            }, (error) => {
                if (error['data'][messageKey] === 'Invalid User') {
                    let messageTitle = this.$translate.instant('MENUPAGE_NICKNAME_IN_USE_TITLE');
                    let messageText = this.$translate.instant('MENUPAGE_NICKNAME_IN_USE');
                    this.$mdDialog.show(
                        this.$mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title(messageTitle)
                            .textContent(messageText)
                            .ok('OK')
                    );
                } else {
                    // Close client wall if wall was closed by teacher
                    this.data.wall.closed = true;
                    this.stopPolling();
                    this.showClosingDialog();
                }
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    // Accessor functions for passing messages between directives
    setMessageToEdit(message: models.Message) {
        if (message === null && this.data.status.messageOrigin === null) {
            //no message, create a new one
            this.data.status.messageToEdit = new models.Message();
            this.data.status.messageToEdit.creator = this.data.user.nickname;
            this.data.status.messageToEdit.origin.push({nickname: this.data.user.nickname, message_id: null});
            this.data.status.messageToEdit.question_id = this.data.question._id;
        } else if (message === null && this.data.status.messageOrigin !== null) {
            //we have an origin to create the new message, clone it
            this.data.status.messageToEdit = new models.Message().createFromOrigin(this.data.status.messageOrigin, this.data.user.nickname);
            this.data.status.updateOrigin = typeof this.data.status.messageOrigin.board[this.data.user.nickname] !== 'undefined';
        } else {
            this.data.status.messageToEdit = message;
        }
    }

    clearMessageToEdit() {
        this.data.status.messageToEdit = null;
    }

    // If we are changing questions, or a new question, set the polling params correctly. Input new question index.
    setQuestion(newIndex: number, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
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
            // As this operation returns a promise - possible a second request to iterate question is made before the first is resolved
            if (newIndex > this.data.wall.questions.length - 1) {
                return;
            }
            this.data.question = new models.Question("").updateMe(this.data.wall.questions[newIndex]);
            this.data.status.currentQuestionIndex = newIndex;
            this.data.status.contributors = this.data.question.contributors;
            // Re-do the hashtag list
            this.buildTagArray();
        }

        // Get the whole message list if we are 'new' or 'changing'
        // Notify a change of question if we are the teacher
        if (control !== 'none' && this.data.question !== null) {
            this.getMessages(() => {
                if (this.data.status.authorised) {
                    this.notifyChangedQuestion(this.data.question._id, previous_question_id, null, null);
                }
            }, () => {
                console.log('Get message error');
            });
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

    closeWallNow(targetEmail: string): void {
        let handle = this;
        this.data.wall.closed = true;
        this.data.wall.targetEmail = targetEmail;
        this.updateWall(null, function() {
            handle.$window.location.href = handle.urlService.getHost() + '/#/organise';
        }, null);
    }

    /*
     getNickname(): string {
     return this.data.status.authorised ? this.data.user.nickname : this.data.status.studentNickname;
     }
     */

    updateWall(wall: models.Wall, successCallbackFn: (success: models.Wall) => void, errorCallbackFn: (error: {}) => void): void {
        if (wall === null) {
            wall = this.data.wall;
        }
        this.$http.put(this.urlService.getHost() + '/wall', {
            wall: wall
        })
            .then((response) => {
                if (typeof successCallbackFn === "function") {
                    successCallbackFn(response['data']['result']);
                }
            }, (error) => {
                console.log('--> DataService: updateWall failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    notifyChangedQuestion(new_question_id: string, previous_question_id: string, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        this.$http.get(this.urlService.getHost() + '/change/' + this.data.user.nickname + '/' + this.data.wall._id + '/' + new_question_id + '/' + previous_question_id)
            .then(() => {
                if (typeof successCallbackFn === "function") {
                    successCallbackFn(null);
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
    requestPoll(previousQuestionId: string, control: string, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        let question_id = 'none', pollRoute = '/poll/';
        if (this.data.question !== null) {
            question_id = this.data.question._id;
        }
        if (this.data.status.authorised) {
            pollRoute = '/pollteacher/';
        }
        this.$http.get(this.urlService.getHost() + pollRoute + this.data.user.nickname + '/' + this.data.wall._id +
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
                    successCallbackFn(null);
                }
            }, (error) => {
                console.log('Poll FAILED at ' + Date.now().toString());
                if (error.status === 503) {
                    this.showToast('Server very busy..');
                    this.stopPolling();
                    this.$timeout(() => {
                        this.startPolling();
                    }, 5000 + Math.random()*10);
                } else if (error.status === 401) {
                    this.data.status.authorised = false;
                    this.stopPolling();
                    this.$window.location.href = this.urlService.getHost() + '/#/';
                }
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });

        // Send logs to server
        if (this.logCycleCounter === constants['POLLS_PER_LOG_ATTEMPT']) {
            this.logCycleCounter = 0;
            if(this.data.log.length > 0) {
                this.$http.post(this.urlService.getHost() + '/logs/' + this.data.wall._id +
                    '/' + this.data.user.nickname, {logs: this.data.log})
                    .then(() => {
                        this.data.log.length = 0;
                        console.log('--> DataService: log success');
                    }, (error) => {
                        console.log('--> DataService: log failure: ' + error['message']);
                    });
            }
        } else {
            this.logCycleCounter++;
        }
    }


    setQuestionToEdit(question: models.Question): void {
        this.data.status.questionToEdit = question;
    }

    //generate a new question on server with _id and returns it
    addQuestion(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        this.$http.post(this.urlService.getHost() + '/question', {wall_id: this.data.wall._id, question: this.data.status.questionToEdit})
            .then((response) => {
                let resultKey: string = 'result', firstQuestion: boolean;
                firstQuestion = this.data.wall.questions.length === 0;
                this.data.wall.questions.push(response.data[resultKey]);
                this.logAnEvent(models.LogType.CreateTask, response.data[resultKey]._id, null, response.data[resultKey].label, null, '');

                // If this was the first question, set it
                if (firstQuestion) {
                    this.setQuestion(0, successCallbackFn, errorCallbackFn);
                }
                if (typeof successCallbackFn === "function") {
                    successCallbackFn(null);
                }
            }, (error) => {
                console.log('--> DataService: addQuestion failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    updateQuestion(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        if (this.data.status.questionToEdit === null) {
            errorCallbackFn({status: '400', message: "question is not defined"});
        }

        this.$http.put(this.urlService.getHost() + '/question', {
            wall_id: this.data.wall._id,
            question: this.data.status.questionToEdit
        })
            .then(() => {
                console.log('updating the question');
                this.logAnEvent(models.LogType.EditTask, this.data.status.questionToEdit._id, null, this.data.status.questionToEdit.label, null, '');
                if(this.data.status.questionToEdit._id === this.data.question._id) {
                    this.data.question.updateMe(this.data.status.questionToEdit);
                }
                this.data.status.questionToEdit.showControls = false;
                if (typeof successCallbackFn === "function") {
                    successCallbackFn(null);
                }
            }, (error) => {
                console.log('--> DataService: updateQuestion failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            })
    }

    deleteQuestion(question: models.Question, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        //first check if there are existing message for that question
        this.$http.get(this.urlService.getHost() + '/messages/' + question._id)
            .then((result) => {
                console.log('--> DataService deleteQuestion: deleteQuestion success');
                this.logAnEvent(models.LogType.DeleteTask, question._id, null, question.label, null, '');
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
    addMessage(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        let nickname = this.data.user.nickname;
        if (this.data.status.messageToEdit === null) {
            errorCallbackFn({status: '400', message: "message is not defined"});
        }
        this.data.status.messageToEdit.edits.push({date: new Date(), text: this.data.status.messageToEdit.text});
        if (this.data.status.updateOrigin) {
            // If the message was created from another, add it to the board, it will replace the origin message's location
            this.data.status.messageToEdit.board[this.data.user.nickname] = this.data.status.messageOrigin.board[this.data.user.nickname];
        }
        let clientType = this.data.status.authorised ? '/messageteacher' : '/message';
        this.$http.post(this.urlService.getHost() + clientType, {
            message: this.data.status.messageToEdit,
            wall_id: this.data.wall._id,
            nickname: nickname
        }).then((result) => {
                let resultKey = 'result';
                this.data.question.messages.push(new models.Message().updateMe(result.data[resultKey]));
                this.parseMessageForTags(result.data[resultKey]);
                if (this.data.status.contributors.indexOf(this.data.user.nickname) === -1) {
                    this.data.status.contributors.push(this.data.user.nickname);
                }
                this.data.status.messageToEdit = null;
                if (this.data.status.updateOrigin) {
                    //the new cloned message was created from a message on the board, so remove my nickname from the old one
                    delete this.data.status.messageOrigin.board[this.data.user.nickname];
                    this.$http.put(this.urlService.getHost() + clientType, {
                        messages: [this.data.status.messageOrigin],
                        wall_id: this.data.wall._id,
                        nickname: this.data.user.nickname,
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
                    successCallbackFn(null);
                }
            }, (error) => {
                console.log('--> DataService: addMessage failure: ' + error);
                if (typeof errorCallbackFn === "function") {
                    errorCallbackFn({status: error.status, message: error.message});
                }
            });
    }

    getMessages(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        if (this.data.question !== null) {
            this.$http.get(this.urlService.getHost() + '/messages/' + this.data.question._id)
                .then((result) => {
                    this.data.question.messages = [];
                    let resultKey = 'result';
                    result.data[resultKey].forEach((m: any) => {
                        this.data.question.messages.push(new models.Message().updateMe(m));
                    });

                    this.buildTagArray();
                    this.refreshBoardMessages();
                    if(successCallbackFn) {
                        successCallbackFn(null);
                    }
                }, (error) => {
                    console.log('--> DataService: getMessages failure: ' + error);
                    if(errorCallbackFn) {
                        errorCallbackFn(null);
                    }
                });
        }
    }

    buildTagArray(): void {
        let handle = this;
        this.data.status.tagCounter = {};
        this.data.status.tags = [];
        this.data.question.messages.forEach(function (message: models.Message) {
            if (!message.deleted) {
                handle.parseMessageForTags(message);
            }
        });
    }

    parseMessageForTags(message: models.Message): void {
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
        let messages: models.Message[] = [];
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
    updateMessages(messages: Array<models.Message>, controlString: string): void {

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
                    messages.forEach((message) => {
                        this.parseMessageForTags(message);
                    });
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
        return constants.BACKGROUND_COLOURS[this.data.status.currentQuestionIndex];
    }

    getGridStyle(type: string): {} {
        let heightKey = 'VIEW_HEIGHT', widthKey = 'VIEW_WIDTH';
        if (type === 'horizontal') {
            return {
                top : Math.floor(this.data.status.boardDivSize[heightKey] / 2) + 'px',
                position : 'absolute',
                borderColor : constants.COMPLEMENTARY_COLOURS[this.data.status.currentQuestionIndex],
                backgroundColor : constants.COMPLEMENTARY_COLOURS[this.data.status.currentQuestionIndex],
                margin: 0
            };
        } else {
            return {
                left : Math.floor(this.data.status.boardDivSize[widthKey] / 2) + 'px',
                position : 'absolute',
                borderColor : constants.COMPLEMENTARY_COLOURS[this.data.status.currentQuestionIndex],
                backgroundColor : constants.COMPLEMENTARY_COLOURS[this.data.status.currentQuestionIndex],
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
            this.pollingTimerHandle = this.$interval(requestThePoll, constants['POLL_INTERVAL_SECONDS'] * 1000);
        }

    }

    // Stop the polling timer
    stopPolling() {
        this.$interval.cancel(this.pollingTimerHandle);
        this.pollingTimerHandle = null;
    }

    // Process updated messages retrieved on the poll response
    processUpdatedMessages(pollUpdateObject: models.PollUpdate) {

        // Update participant list
        let participants = Object.keys(pollUpdateObject.status.connected_students);
        this.data.status.participants = participants.concat(Object.keys(pollUpdateObject.status.connected_teachers));
        // We should not be here! Go back to the landing page
        if (this.data.status.participants.indexOf(this.data.user.nickname) === -1) {
            this.$window.location.href = this.urlService.getHost() + '/';
        }

        // Run on teacher connections only
        if (this.data.status.authorised) {
            // Update total number of talkwall users
            this.data.status.totalOnTalkwall = pollUpdateObject.totalOnTalkwall;
            this.data.status.idleTerminationTime = pollUpdateObject.status.idleTerminationTime;
        }

        // Status update, get the updated Wall
        if (pollUpdateObject.status.last_update > this.data.status.last_status_update && this.data.wall !== null) {
            this.data.status.last_status_update = pollUpdateObject.status.last_update;

                this.requestWallUnauthorised(this.data.wall._id, () => {

                    // If we are a student, set to a new question if available
                    if (!this.data.status.authorised) {
                        let new_question_id = pollUpdateObject.status.teacher_current_question;
                        if (new_question_id !== 'none') {
                            let new_question_index = UtilityService.getQuestionIndexFromWallById(new_question_id, this.data.wall);

                            // Trigger a question and message update
                            this.data.question = null;
                            this.setQuestion(new_question_index, null, null);
                        }
                    }

                }, null);
        }


        // Check that a deleted user is removed the contributor list
        let self = this;
        function checkAndRemoveDeletedContributor(nickname: string) {
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
            let message = new models.Message().updateMe(pollUpdateObject.created[message_id]);
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
                        message.updateBoard(update.board, true, this.data.user.nickname);
                        break;

                    case 'mixed':
                        message.text = update.text;
                        message.deleted = update.deleted;
                        if (message.deleted) {
                            checkAndRemoveDeletedContributor(message.creator);
                        }
                        message.updateBoard(update.board, true, this.data.user.nickname);
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

    disconnectFromWall(successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
        let closingUrl = this.urlService.getHost() + (this.data.status.authorised ? '/#/organiser' : '/#/');
        let disconnectUrl = this.urlService.getHost() + (this.data.status.authorised ? '/disconnectteacher/' : '/disconnect/')
            + this.data.user.nickname + '/' + this.data.wall._id;
        this.$http.get(disconnectUrl)
            .then(() => {
                this.stopPolling();
                this.data.wall = null;
                this.data.question = null;
                this.data.status.currentQuestionIndex = -1;
                this.$window.location.href = closingUrl;
            }, () => {
                this.stopPolling();
                this.data.wall = null;
                this.data.question = null;
                this.data.status.currentQuestionIndex = -1;
                this.$window.location.href = closingUrl;
            });
    }

    showClosingDialog() : void {
        //detects if the device is small
        // let useFullScreen = (this.$mdMedia('sm') || this.$mdMedia('xs'))  && this.customFullscreen;
        let self = this;
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
                self.disconnectFromWall(null, null);
            }, function() {
                //dialog dismissed
                console.log('--> LandingController: dismissed');
                self.disconnectFromWall(null, null);
            });
    }

    getExportWall(wallId: string, successCallbackFn: (success: {}) => void, errorCallbackFn: (error: {}) => void): void {
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
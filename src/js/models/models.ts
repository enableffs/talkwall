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

import MomentStatic = moment.MomentStatic;

export class LogType {
    public static readonly CreateMessage = "mc";
    public static readonly EditMessage = "me";
    public static readonly PinMessage = "mp";
    public static readonly UnPinMessage = "mup";
    public static readonly DeleteMessage = "md";
    public static readonly HighlightMessage = "mh";
    public static readonly UnHighlightMessage = "muh";
    public static readonly MoveMessage = "mm";
    public static readonly CreateTask = "tc";
    public static readonly EditTask = "te";
    public static readonly DeleteTask = "td";
}

export class User {
    _id: string;
    nickname: string;
    lastOpenedWall: string;   //wall _id
    defaultEmail: string;
    recentWalls: string[];
}

export class Wall {
    _id: string;
    pin: string;
    label: string;
    theme: string;
    createdAt: Date;
    lastOpenedAt: Date;
    createdBy: string;
    closed: boolean;
    deleted: boolean;
    questions: Array<Question>;
    organisers: Array<User>;
    targetEmail: string;
    questionIndex: number;
    trackLogs: boolean;
}

export interface IQuestion {
    _id: string;
    createdAt: Date;
    label: string;
    grid: string;
    messages: Array<Message>;
    contributors: Array<string>;

    updateMe(newQuestion: {}): Question;
}

export class Question implements IQuestion {
    _id: string;
    createdAt: Date;
    label: string;
    grid: string;
    messages: Array<Message>;
    showControls: boolean;
    contributors: Array<string>;
    isNew: boolean;

    constructor(label: string) {
        this.label = label;
        this.grid = 'none';
        this.messages = [];
        this.showControls = false;
        this.createdAt = new Date();
        this.contributors = [];
        this.isNew = false;
    }

    updateMe(newQuestion: {}): Question {
        if(typeof newQuestion === 'undefined') {
            return;
        }
        this._id = newQuestion['_id'];
        this.createdAt = newQuestion['createdAt'];
        this.label = newQuestion['label'];
        this.grid = newQuestion['grid'];
        if (typeof newQuestion['contributors'] !== 'undefined' && newQuestion['contributors'] !== null) {
            this.contributors = newQuestion['contributors'];
        }

        return this;
    }
}


/* Sub classes for Message */

export class Nickname {
    xpos: number;
    ypos: number;
    highlighted: boolean;

    constructor(x: number, y: number, highlighted: boolean) {
        this.xpos = x;
        this.ypos = y;
        this.highlighted = highlighted;
    }

    updateMe(x: number, y: number, highlighted: boolean) {
        this.xpos = x;
        this.ypos = y;
        this.highlighted = highlighted;
    }
}

export interface IMessage {
    updateMe(newMessage: {}): Message;
}

export class Message implements IMessage {
    _id: string;
    question_id: string;
    createdAt: Date;
    text: string;
    creator: string;        //nickname
    deleted: boolean;
    isHighlighted: boolean;  // dynamic local attribute - not stored at server
    origin: {}[];
    edits: {}[];
    board: { [nickname: string] : Nickname };

    constructor() {
        this.createdAt = new Date();
        this.deleted = false;
        this.text = '';
        this.origin = [];
        this.edits = [];
        this.board = {};
        this.isHighlighted = false;
    }

    createFromOrigin(originMessage: Message, newNickname: string) {

        // no _id until sent to server

        this.text = originMessage.text;
        this.creator = newNickname;
        this.question_id = originMessage.question_id;

        this.origin.push({nickname: newNickname, message_id: originMessage._id});
        originMessage.origin.forEach((origin) => {
            this.origin.push(origin);
        });

        //this.origin.reverse();

        if (typeof originMessage.board[newNickname] !== 'undefined') {
            this.board[newNickname] = new Nickname(
                originMessage.board[newNickname].xpos,
                originMessage.board[newNickname].ypos,
                originMessage.board[newNickname].highlighted
            );
        }

        return this;
    }

    updateMe(newMessage: {}) {
        this._id = newMessage['_id'];
        this.createdAt = newMessage['createdAt'];
        this.deleted = newMessage['deleted'];
        this.creator = newMessage['creator'];
        this.text = newMessage['text'];
        this.question_id = newMessage['question_id'];

        if (typeof newMessage['board'] !== 'undefined' && newMessage['board'] !== null) {
            this.updateBoard(newMessage['board'], false, '');
        } else {
            // Remove all nicknames
            for (let nickname in this.board) {
                if(this.board.hasOwnProperty(nickname)) {
                    delete this.board[nickname];
                }
            }
        }

        if (typeof newMessage['origin'] !== 'undefined' && newMessage['origin'] !== null) {
            this.origin = newMessage['origin'];
        }

        if (typeof newMessage['edits'] !== 'undefined' && newMessage['edits'] !== null) {
            this.edits = newMessage['edits'];
        }

        return this;
    }

    // If updateMyself is true, include my nickname in the update
    updateBoard(newBoard: {}, excludeMyself: boolean, myNickname: string) {
        for (let nickname in newBoard) {
            if( (!excludeMyself || nickname !== myNickname) && newBoard.hasOwnProperty(nickname)) {

                // Update an existing nickname
                if(this.board.hasOwnProperty(nickname)) {
                    this.board[nickname].updateMe(
                        newBoard[nickname]['xpos'],
                        newBoard[nickname]['ypos'],
                        newBoard[nickname]['highlighted']);
                }
                // Create a new nickname
                else {
                    this.board[nickname] = new Nickname(
                        newBoard[nickname]['xpos'],
                        newBoard[nickname]['ypos'],
                        newBoard[nickname]['highlighted']);
                }
            }
        }
        // Remove nicknames no longer in the updated message, except my own as only I can remove it from my board
        for (let nickname in this.board) {
            if(this.board.hasOwnProperty(nickname) && !newBoard.hasOwnProperty(nickname) && nickname !== myNickname) {
                delete this.board[nickname];
            }
        }
    }
}


// Queues contain only the modifiable data needed

export class UpdatedQueueItem {
    board: { [nickname: string] : {
            xpos: number;
            ypos: number;
            highlighted: boolean;
        }
    };
    text: string;
    deleted: boolean;
    updateType: string;         // 'edit' , 'position' or 'mixed'
}

export class CreatedQueueItem {
    createdAt: Date;
    creator: string;
    origin: Array<{
        nickname: String,
        message_id: String
    }>;
    board: { [nickname: string] : {
        xpos: number,
        ypos: number,
        highlighted: boolean
    } };
    text: string;
    deleted: boolean;
}

// Class used to send and respond with status & message updates through polling
export class PollUpdate {
    totalOnTalkwall: number;
    status: {
        last_update: number;
        last_access: number;
        teacher_current_question: string;
        connected_teachers: Array<string>;
        connected_students: Array<string>;
        idleTerminationTime: number;
    };
    created: { [message_id: string] : CreatedQueueItem };
    updated: { [message_id: string] : UpdatedQueueItem };

    // set status to PollUpdate('', false) to prevent any status update on server
    constructor(question_id: string) {
        this.totalOnTalkwall = 0;
        this.status = {
            last_update: Date.now(),
            last_access: Date.now(),
            teacher_current_question: question_id,
            connected_teachers: [],
            connected_students: [],
            idleTerminationTime: 0
        };
        this.created = {};
        this.updated = {};
    }
}

export class LogEntry {
    q_id: string;
    type: LogType;
    itemid: string;
    nick: string;
    text: string;
    stamp: Date;
    diff: {x: number, y: number };
    basedOn:    {
        itemid: string,
        nick:   string,
        text:   string
    };

    constructor(type: LogType, id: string, nickname: string, text: string, question_id: string, diff: {x: number, y: number}, basedOn: { itemid: string, nick: string, text: string }) {

        // In cases where we record a 'question' event, the itemid will match the q_id

        this.q_id = question_id;
        this.type = type;
        this.itemid = id;
        this.nick = nickname;
        this.text = text;
        if (diff !== null) {
            this.diff = diff;
        } else {
            this.diff = null;
        }
        this.stamp = new Date();
        if (basedOn !== null) {
            this.basedOn = basedOn;
        } else {
            this.basedOn = null;
        }
    }
}


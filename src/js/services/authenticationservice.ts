/// <reference path="../_references.ts"/>

module TalkwallApp {
	"use strict";

	export interface IAuthenticationService {
		isAuthenticated: boolean;
	}

	export class AuthenticationService implements IAuthenticationService {
		private _isAuthenticated: boolean = false;

		public get isAuthenticated(): boolean {
			return this._isAuthenticated;
		}
		public set isAuthenticated(value: boolean) {
			this._isAuthenticated = value;
		}
	}
}

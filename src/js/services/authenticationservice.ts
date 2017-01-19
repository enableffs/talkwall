export class AuthenticationService {
	private _isAuthenticated: boolean = false;

	public get isAuthenticated(): boolean {
		return this._isAuthenticated;
	}
	public set isAuthenticated(value: boolean) {
		this._isAuthenticated = value;
	}
}
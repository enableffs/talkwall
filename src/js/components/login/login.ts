import IDialogService = angular.material.IDialogService;
export class LoginController {
	static $inject = ['$mdDialog'];

	constructor(
		private $mdDialog: IDialogService) {
		console.log('--> LoginController: started: ');
	}

	/**
	 * hide this dialog (see angular.material.IDialogService)
	 * @aparam response a possible reponse
	 */
	hide(response?: any): void {
		console.log('--> LoginController: hide');
		this.$mdDialog.hide();
	};
	/**
	 * cancel this dialog (see angular.material.IDialogService)
	 * @aparam response a possible reponse
	 */
	cancel(response?: any) : void {
		console.log('--> LoginController: cancel');
		this.$mdDialog.cancel();
	};
	/**
	 * answer this dialog
	 * @aparam answer aa a string
	 */
	answer(answer: string): void {
		console.log('--> LoginController: answer: ' + answer);
		this.$mdDialog.hide(answer);
	};
}
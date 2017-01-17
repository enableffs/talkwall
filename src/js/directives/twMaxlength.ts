/// <reference path="../_references.ts"/>

module TalkwallApp {

	"use strict";
    TwMaxlength.$inject = ['$mdUtil'];


	export function TwMaxlength($mdUtil): ng.IDirective {

        let link: ng.IDirectiveLinkFn = function(scope: ng.IScope, element: JQuery, attrs: ng.IAttributes, ctrls: any) {
            let ngModelCtrl = ctrls[0];
            let containerCtrl = ctrls[1];

            $mdUtil.nextTick(function() {
                let errorsSpacer = angular.element(containerCtrl.element[0].querySelector('.md-errors-spacer'));
                let charCountEl = angular.element('<div class="md-char-counter">');

                // Append our character counter inside the errors spacer
                errorsSpacer.append(charCountEl);

                ngModelCtrl.$formatters.push(renderCharCount);
                ngModelCtrl.$viewChangeListeners.push(renderCharCount);

                element.on('input keydown keyup', function () {
                    renderCharCount(null); //make sure it's called with no args
                });

                attrs.$set("ngTrim", "false");

                let maxlength = parseInt(attrs['twMaxlength'], 10);
                ngModelCtrl.$parsers.push(function (value) {
                    if (value.length > maxlength) {
                        value = value.substr(0, maxlength);
                        ngModelCtrl.$setViewValue(value);
                        ngModelCtrl.$render();
                    }
                    renderCharCount(null);
                    return value;
                });

                function renderCharCount(value) {
                    // If we have not been appended to the body yet; do not render
                    if (!charCountEl.parent) {
                        return value;
                    }

                    // Force the value into a string since it may be a number,
                    // which does not have a length property.
                    charCountEl.text(String(element.val() || value || '').length + ' / ' + maxlength);
                    return value;
                }
            });

        };

		return {
			restrict: 'A',
            require: ['ngModel', '^mdInputContainer'],
			link: link
		};
	}
}

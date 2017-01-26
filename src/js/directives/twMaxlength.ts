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

TwMaxlength.$inject = ['$mdUtil'];
export function TwMaxlength($mdUtil: any): ng.IDirective {

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
            ngModelCtrl.$parsers.push(function (value: string) {
                if (value.length > maxlength) {
                    value = value.substr(0, maxlength);
                    ngModelCtrl.$setViewValue(value);
                    ngModelCtrl.$render();
                }
                renderCharCount(null);
                return value;
            });

            function renderCharCount(value: string) {
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
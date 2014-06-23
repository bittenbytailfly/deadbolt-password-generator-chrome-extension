/*    
    Copyright 2012, 2014 Ed Carter

    This file is part of Deadbolt Password Generator.

    Deadbolt Password Generator is free software: you can redistribute
    it and/or modify it under the terms of the GNU General Public
    License as published by the Free Software Foundation, either
    version 3 of the License, or (at your option) any later version.

    Deadbolt Password Generator is distributed in the hope that it
    will be useful, but WITHOUT ANY WARRANTY; without even the implied
    warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
    See the GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Deadbolt Password Generator.  If not, see
    <http://www.gnu.org/licenses/>.
 */

'use strict';

angular.module('deadboltPasswordGeneratorApp.directives', [])
    .directive('dbHighlight', [function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attr) {
                elem.bind('click', function () {
                    var selection, range, doc, win;
                    if ((doc = elem[0].ownerDocument) && (win = doc.defaultView) && typeof
                            win.getSelection != 'undefined' && typeof doc.createRange !=
                            'undefined' && (selection = window.getSelection()) && typeof
                            selection.removeAllRanges != 'undefined') {
                        range = doc.createRange();
                        range.selectNode(elem[0]);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                });
            }
        };
    }])
    .directive('dbFocus', [function () {
        return {
            restrict: 'A',
            scope: {
                dbFocus: '='
            },
            link: function (scope, elem, attrs) {
                scope.$watch('dbFocus', function (newval, oldval) {
                    if (newval) {
                        elem[0].focus();
                    }
                }, true);
                elem.bind('blur', function () {
                    scope.$apply(function () { scope.dbFocus = false; });
                });
                elem.bind('focus', function () {
                    if (!scope.dbFocus) {
                        scope.$apply(function () { scope.dbFocus = true; });
                    }
                });
            }
        };
    }])
    .directive('dbEnter', [function () {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                elem.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.dbEnter);
                        });
                        event.preventDefault();
                    }
                });
            }
        };
    }])
    .directive('toggleButton', [function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="btn-group">' +
                        '<button type="button" class="btn" ng-class="{active: yes}" ng-click="click(true)">Yes</button>' +
                        '<button type="button" class="btn" ng-class="{active: no}" ng-click="click(false)">No</button>' +
                      '</div>',
            scope: {
                ngModel: '=',
                ngChange: '='
            },
            link: function (scope, element, attr) {
                scope.click = function (value) {
                    scope.ngModel = value;
                };
                scope.$watch('ngModel', function () {
                    scope.yes = scope.ngModel;
                    scope.no = !scope.ngModel;
                    if (scope.ngChange) {
                        scope.ngChange();
                    }
                });
            }
        };
    }])
    .directive('dbFileChange', [function () {
        return {
            retrict: 'A',
            scope: {
                callback: '=dbFileChange'
            },
            link: function (scope, elem, attr) {
                elem.bind('change', function (e) {
                    scope.$apply(function () {
                        var file = e.target.files[0];
                        scope.callback(file);
                    });
                });
            }
        };
    }]);
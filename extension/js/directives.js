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
    .directive('toggleButton', [function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="btn-group">' +
                        '<button type="button" class="btn" ng-class="{active: yes}" ng-click="click(true)">Yes</button>' +
                        '<button type="button" class="btn" ng-class="{active: no}" ng-click="click(false)">No</button>' +
                      '</div>',
            scope: {
                ngModel: '='
            },
            link: function (scope, element, attr) {
                scope.click = function (value) {
                    scope.ngModel = value;
                };
                scope.$watch('ngModel', function () {
                    scope.yes = scope.ngModel;
                    scope.no = !scope.ngModel;
                });
            }
        };
    }]);
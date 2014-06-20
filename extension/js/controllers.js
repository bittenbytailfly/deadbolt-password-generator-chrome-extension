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

angular.module('deadboltPasswordGeneratorApp.controllers', ['ui.bootstrap'])
    .controller('popupCtrl', function ($scope, settingsRepository, deadboltSettingsFactory, analyticsService) {
        $scope.placeHolders = ['rainforest book shop', 'black horse banking', 'dark blue social', 'bird song status update', 'grocery shopping'];
        $scope.placeHolderValue = 'e.g. ' + $scope.placeHolders[Math.floor((Math.random() * $scope.placeHolders.length))];
        $scope.minimumPhraseLength = 6;
        $scope.memorablePhrase = '';
        $scope.showPassword = false;
        $scope.password = '';
        $scope.memorablePhraseFocused = true;
        $scope.injectable = false;
        $scope.revealMode = 'none';

        settingsRepository.getSettings(function (deadboltSettings) {
            $scope.$apply(function () {
                $scope.profiles = deadboltSettings.simpleProfileList;
                $scope.selectedProfile = deadboltSettingsFactory.findMatchingProfileByName($scope.profiles, deadboltSettings.defaultProfileName);
                $scope.clipboardSettings = deadboltSettings.clipboardSettings;
                $scope.enterKeySettings = deadboltSettings.enterKeySettings;
            });
        });

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
            chrome.tabs.executeScript(tabs[0].id, { file: "js/inject-password.js" }, function () {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'checkPasswordInputAvailable' }, function (r) {
                    if (r != null) {
                        $scope.$apply(function () {
                            $scope.injectable = r.available;
                        });
                    }
                });
            });
        });

        $scope.$watch('selectedProfile', function () {
            $scope.memorablePhraseFocused = true;
        });

        $scope.remainingCharacterText = function () {
            switch ($scope.memorablePhrase.length) {
                case 0:
                    return 'Enter at least ' + $scope.minimumPhraseLength + ' characters';
                case $scope.minimumPhraseLength - 1:
                    return 'Enter at least 1 more character';
                default:
                    return 'Enter at least ' + ($scope.minimumPhraseLength - $scope.memorablePhrase.length) + ' more characters';
            }
        };

        $scope.buttonsEnabled = function () {
            return $scope.memorablePhrase.length >= $scope.minimumPhraseLength;
        };

        // Click Handlers

        $scope.openHomePage = function () {
            window.close();
            chrome.tabs.create({
                url: 'http://www.deadboltpasswordgenerator.com/'
            });
        };

        $scope.openSettingsPage = function () {
            window.close();
            chrome.tabs.create({
                url: 'options.htm'
            });
        };

        $scope.inputPhraseType = function () {
            return $scope.showPassword ? 'text' : 'password';
        };

        $scope.enterKeyPressed = function () {
            if ($scope.enterKeySettings.enabled && $scope.buttonsEnabled()) {
                switch ($scope.enterKeySettings.behaviour) {
                    case 'R':
                        $scope.revealPassword();
                        break;
                    case 'C':
                        $scope.copyPasswordToClipboard();
                        break;
                    case 'AR':
                        if ($scope.injectable) {
                            $scope.injectPassword();
                        }
                        else {
                            $scope.revealPassword();
                        }
                        break;
                    case 'AC':
                        if ($scope.injectable) {
                            $scope.injectPassword();
                        }
                        else {
                            $scope.copyPasswordToClipboard();
                        }
                        break;
                }
            }
        };

        $scope.revealPassword = function () {
            $scope.revealMode = 'revealed';
            $scope.password = encodePassword($scope.memorablePhrase, $scope.selectedProfile.pin1 + $scope.selectedProfile.pin2 + $scope.selectedProfile.pin3 + $scope.selectedProfile.pin4, $scope.selectedProfile.includeSymbols, $scope.selectedProfile.caseSensitive, $scope.selectedProfile.passwordLength);
            analyticsService.postEvent('Revealed', $scope.selectedProfile);
        };

        $scope.copyPasswordToClipboard = function () {
            $scope.password = encodePassword($scope.memorablePhrase, $scope.selectedProfile.pin1 + $scope.selectedProfile.pin2 + $scope.selectedProfile.pin3 + $scope.selectedProfile.pin4, $scope.selectedProfile.includeSymbols, $scope.selectedProfile.caseSensitive, $scope.selectedProfile.passwordLength);
            var message = {
                command: 'copyPasswordToClipboard',
                data: {
                    password: $scope.password,
                    timerEnabled: $scope.clipboardSettings.enabled,
                    secondsToCopy: $scope.clipboardSettings.seconds
                }
            };
            chrome.runtime.sendMessage(message, function () {
                $scope.$apply(function() {
                    $scope.revealMode = 'copied';
                    analyticsService.postEvent('Copied', $scope.selectedProfile);
                });
            });
        };

        $scope.injectPassword = function () {
            $scope.password = encodePassword($scope.memorablePhrase, $scope.selectedProfile.pin1 + $scope.selectedProfile.pin2 + $scope.selectedProfile.pin3 + $scope.selectedProfile.pin4, $scope.selectedProfile.includeSymbols, $scope.selectedProfile.caseSensitive, $scope.selectedProfile.passwordLength);
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { command: 'inject', data: { password: $scope.password } }, function () {
                    $scope.$apply(function () {
                        $scope.revealMode = 'injected';
                        analyticsService.postEvent('Injected', $scope.selectedProfile);
                    });
                });
            });
        };

        $scope.toggleShowPhrase = function () {
            $scope.showPassword = !$scope.showPassword;
        };

        // End Click Handlers
    })

    .controller('settingsCtrl', function ($scope, $modal, settingsRepository, deadboltSettingsFactory) {

        var changeWatchers = new Array();

        $scope.loadSettings = function () {
            settingsRepository.getSettings(function (deadboltSettings) {
                $scope.$apply(function () {
                    $scope.profiles = deadboltSettings.simpleProfileList;
                    $scope.defaultProfile = deadboltSettingsFactory.findMatchingProfileByName($scope.profiles, deadboltSettings.defaultProfileName);
                    $scope.clipboardSettings = deadboltSettings.clipboardSettings;
                    $scope.enterKeySettings = deadboltSettings.enterKeySettings;
                    $scope.activeTab = 0;
                    $scope.changesMade = false;
                    
                    changeWatchers.push($scope.$watch('profiles', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $scope.changesMade = true;
                        }
                    }, true));
                    changeWatchers.push($scope.$watch('defaultProfile', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $scope.changesMade = true;
                        }
                    }, true));
                    changeWatchers.push($scope.$watch('clipboardSettings', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $scope.changesMade = true;
                        }
                    }, true));
                    changeWatchers.push($scope.$watch('enterKeySettings', function (newVal, oldVal) {
                        if (newVal !== oldVal) {
                            $scope.changesMade = true;
                        }
                    }, true));
                });
            });
        }

        $scope.loadSettings();

        $scope.createProfile = function () {
            var p = deadboltSettingsFactory.createDefaultProfile('Profile ' + ($scope.profiles.length + 1));
            $scope.profiles.push(p);
            $scope.activeTab = $scope.profiles.length - 1;
        };

        $scope.setActiveTab = function (i) {
            $scope.activeTab = i;
        };

        $scope.removeProfile = function (i) {
            var deletedProfile = $scope.profiles.splice(i, 1)[0];
            if (deletedProfile == $scope.defaultProfile) {
                $scope.defaultProfile = $scope.profiles[0];
            }
            var profileCount = $scope.profiles.length;
            if (i < $scope.activeTab) {
                $scope.activeTab--;
            }
            else if (i == $scope.activeTab) {
                if (i == profileCount) {
                    $scope.activeTab = profileCount - 1;
                }
                else {
                    $scope.activeTab = i;
                }
            }
        };

        $scope.save = function () {
            var deadboltSettings = new deadboltSettingsFactory.deadboltSettings($scope.defaultProfile.name, $scope.profiles, $scope.clipboardSettings, $scope.enterKeySettings);
            settingsRepository.saveSettings(deadboltSettings, $scope.saveComplete);
        };

        $scope.saveComplete = function () {
            $scope.$apply(function() { $scope.changesMade = false });
        };

        $scope.cancel = function () {
            angular.forEach(changeWatchers, function (watcher) {
                watcher();
            });
            $scope.loadSettings();
            $scope.changesMade = false;
        };

        $scope.pinOptionChanged = function (p) {
            if (!p.usePinNumber) {
                p.pin1 = '0';
                p.pin2 = '0';
                p.pin3 = '0';
                p.pin4 = '0';
            }
        };

        $scope.exportSettings = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/export.htm',
                controller: 'exportCtrl',
                size: 'lg'
            });
        };

    })

    .controller('exportCtrl', function ($scope, $modalInstance, settingsRepository, deadboltSettingsFactory) {
        
        $scope.deadboltSettingsString = '';

        settingsRepository.getSettings(function (deadboltSettings) {
            $scope.$apply(function () {
                $scope.deadboltSettingsString = window.btoa(angular.toJson(deadboltSettings));
            });
        });
        
        $scope.close = function () {
            $modalInstance.dismiss('close');
        };

     });
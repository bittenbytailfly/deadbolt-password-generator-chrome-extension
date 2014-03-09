﻿'use strict';

angular.module('deadboltPasswordGeneratorApp.controllers', [])
    .controller('popupCtrl', function ($scope, settingsRepository, deadboltSettingsFactory) {
        $scope.minimumPhraseLength = 6;
        $scope.memorablePhrase = '';
        $scope.showPassword = false;
        $scope.copiedToClipboard = false;
        $scope.password = '';
        $scope.showingPassword = false;
        $scope.memorablePhraseFocused = true;

        settingsRepository.getSettings(function (deadboltSettings) {
            $scope.$apply(function () {
                $scope.profiles = deadboltSettings.simpleProfileList;
                $scope.selectedProfile = deadboltSettingsFactory.findMatchingProfileByName($scope.profiles, deadboltSettings.defaultProfileName);
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

        $scope.passwordGenerated = function () {
            return $scope.password.length > 0;
        };

        $scope.getPasswordCharacter = function (i) {
            if ($scope.password.length < i) {
                return '';
            }
            return $scope.password.substr(i - 1, 1);
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

        $scope.revealPassword = function () {
            $scope.showingPassword = true;
            $scope.password = encodePassword($scope.memorablePhrase, $scope.selectedProfile.pin1 + $scope.selectedProfile.pin2 + $scope.selectedProfile.pin3 + $scope.selectedProfile.pin4, $scope.selectedProfile.includeSymbols, $scope.selectedProfile.caseSensitive, $scope.selectedProfile.passwordLength);
            analyticsService.postEvent('Revealed', $scope.selectedProfile);
        };

        $scope.copyPasswordToClipboard = function () {
            $scope.password = encodePassword($scope.memorablePhrase, $scope.selectedProfile.pin1 + $scope.selectedProfile.pin2 + $scope.selectedProfile.pin3 + $scope.selectedProfile.pin4, $scope.selectedProfile.includeSymbols, $scope.selectedProfile.caseSensitive, $scope.selectedProfile.passwordLength);
            $scope.copiedToClipboard = true;
            var message = {
                command: 'copyPasswordToClipboard',
                context: { password: $scope.password }
            };
            chrome.extension.getBackgroundPage().postMessage(message, '*');
            analyticsService.postEvent('Copied', $scope.selectedProfile);
        };

        $scope.toggleShowPhrase = function () {
            $scope.showPassword = !$scope.showPassword;
        };

        // End Click Handlers
    })

    .controller('settingsCtrl', function ($scope, settingsRepository, deadboltSettingsFactory) {

        settingsRepository.getSettings(function (deadboltSettings) {
            $scope.$apply(function () {
                $scope.profiles = deadboltSettings.simpleProfileList;
                $scope.defaultProfileName = deadboltSettings.defaultProfileName;
            });
            $scope.$apply(function () {
                $scope.changesMade = false;
            });
        });

        $scope.$watch('profiles', function() {
            $scope.changesMade = true;
        }, true);

        $scope.$watch('defaultProfileName', function () {
            $scope.changesMade = true;
        }, true);

        $scope.createProfile = function () {
            var p = new deadboltSettingsFactory.simpleProfile('Profile ' + ($scope.profiles.length + 1), false, false, false, '0', '0', '0', '0', 15);
            $scope.profiles.push(p);
            $scope.activeTab = $scope.profiles.length - 1;
        };

        $scope.activeTab = 0;

        $scope.setActiveTab = function (i) {
            $scope.activeTab = i;
        };

        $scope.removeProfile = function (i) {
            var deletedProfileName = $scope.profiles[i].name;
            $scope.profiles.splice(i, 1);
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
            if (deletedProfileName == $scope.defaultProfileName) {
                // The default profile has been erased.
                $scope.defaultProfileName = $scope.profiles[0].name;
            };
        };

        $scope.save = function () {
            var deadboltSettings = new deadboltSettingsFactory.deadboltSettings($scope.defaultProfileName, $scope.profiles);
            settingsRepository.saveSettings(deadboltSettings, $scope.saveComplete);
        };

        $scope.saveComplete = function () {
            $scope.$apply(function() { $scope.changesMade = false });
        };

    });
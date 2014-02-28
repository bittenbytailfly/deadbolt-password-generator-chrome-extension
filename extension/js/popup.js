//    Copyright 2012, 2013 Ed Carter
//
//    This file is part of Deadbolt Password Generator.
//
//    Deadbolt Password Generator is free software: you can redistribute 
//    it and/or modify it under the terms of the GNU General Public 
//    License as published by the Free Software Foundation, either 
//    version 3 of the License, or (at your option) any later version.
//
//    Deadbolt Password Generator is distributed in the hope that it 
//    will be useful, but WITHOUT ANY WARRANTY; without even the implied 
//    warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  
//    See the GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with Deadbolt Password Generator.  If not, see 
//    <http://www.gnu.org/licenses/>.

//window.addEventListener('message', function (event) {
//    var command = event.data.command;
//    switch (command) {
//        case 'loaded':
//            retrieveDeadboltSettings(settingsLoaded);
//            break;
//        case 'settingsChangeRequested':
//            chrome.tabs.create({
//                url: 'options.htm'
//            });
//            window.close();
//            break;
//        case 'aboutPageRequested':
//            chrome.tabs.create({
//                url: 'http://www.deadboltpasswordgenerator.com/'
//            });
//            break;
//        case 'copyPasswordToClipboard':
//            var message = {
//                command: 'copyPasswordToClipboard',
//                context: { password: event.data.context.password }
//            };
//            chrome.extension.getBackgroundPage().postMessage(message, '*');
//            break;
//        case 'passwordGenerated':
//            var eventLabel = generateEventLabel(event.data.context.selectedProfile);
//            _gaq.push(['_trackEvent', 'Password Generated', event.data.context.method, eventLabel]);
//    }
//}, false);

//function generateEventLabel(profile) {
//    return 'Symbols:' + profile.includeSymbols +
//        '|Length:' + profile.passwordLength +
//        '|CaseSensitive:' + profile.caseSensitive +
//        '|UsePin:' + profile.usePinNumber;
//}

//function settingsLoaded(deadboltSettings) {
//    var iframe = parent.document.getElementById('popupFrame');
//    var message = {
//        command: 'settings',
//        context: { 'deadboltSettings': deadboltSettings }
//    };
//    iframe.contentWindow.postMessage(message, '*');
//    chrome.extension.getBackgroundPage().postMessage({
//        command: 'initialize'
//    }, '*');
//}

function popupCtrl($scope) {

    $scope.minimumPhraseLength = 6;
    $scope.memorablePhrase = '';
    $scope.showPassword = false;
    $scope.copiedToClipboard = false;
    $scope.password = '';
    $scope.showingPassword = false;

    retrieveDeadboltSettings(function (value) {
        $scope.$apply(function () {
            $scope.load(value);
        });
    });

    $scope.load = function settingsLoaded(deadboltSettings) {
        $scope.profiles = deadboltSettings.simpleProfileList;
        $scope.selectedProfile = findMatchingProfileByName($scope.profiles, deadboltSettings.defaultProfileName);
    };

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
        //self.notifyAnalyticsEvent('Revealed'); TODO: Add analytics back in.
    };

    $scope.copyPasswordToClipboard = function () {
        $scope.password = encodePassword($scope.memorablePhrase, $scope.selectedProfile.pin1 + $scope.selectedProfile.pin2 + $scope.selectedProfile.pin3 + $scope.selectedProfile.pin4, $scope.selectedProfile.includeSymbols, $scope.selectedProfile.caseSensitive, $scope.selectedProfile.passwordLength);
        $scope.copiedToClipboard = true;
        var message = {
            command: 'copyPasswordToClipboard',
            context: { password: $scope.password }
        };
        chrome.extension.getBackgroundPage().postMessage(message, '*');
        //self.notifyAnalyticsEvent('Copied'); TODO: Add analytics back in.
    };

    $scope.toggleShowPhrase = function () {
        $scope.showPassword = !$scope.showPassword;
    };

    // End Click Handlers
}
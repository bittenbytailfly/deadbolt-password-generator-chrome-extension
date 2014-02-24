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

window.addEventListener('message', function (event) {
    var command = event.data.command;
    switch (command) {
        case 'settings':
            main(event.data.context.deadboltSettings);
            break;
    }
}, false);

var deadbolt = function (deadboltSettings) {
    var self = this;
    self.profiles = deadboltSettings.simpleProfileList;
    self.selectedProfile = ko.observable($.grep(deadboltSettings.simpleProfileList, function (p) { return p.name == deadboltSettings.defaultProfileName; })[0]);
    self.minimumPhraseLength = 6;
    self.profileIndex = ko.observable(0);
    self.phrase = ko.observable('');
    self.showPhrase = ko.observable(false);
    self.showingPassword = ko.observable(false);
    self.placeHolders = ['rainforest book shop', 'black horse banking', 'dark blue social', 'bird song status update', 'grocery shopping'];
    self.placeHolderValue = 'e.g. ' + self.placeHolders[Math.floor((Math.random() * self.placeHolders.length))];
    self.password = ko.observable('');
    self.copiedToClipboard = ko.observable(false);
    self.phraseBoxFocused = ko.observable(true);

    console.log(self.selectedProfile());

    self.toggleShowPhrase = function () {
        self.showPhrase(!self.showPhrase());
    }

    self.revealPassword = function () {
        self.showingPassword(true);
        self.password(encodePassword(self.phrase(), self.selectedProfile().pin1 + self.selectedProfile().pin2 + self.selectedProfile().pin3 + self.selectedProfile().pin4, self.selectedProfile().includeSymbols, self.selectedProfile().caseSensitive, self.selectedProfile().passwordLength));
        self.notifyAnalyticsEvent('Revealed');
    };

    self.settingsChangeRequested = function () {
        parent.postMessage({ command: 'settingsChangeRequested' }, '*');
    };

    self.aboutPageRequested = function () {
        parent.postMessage({ command: 'aboutPageRequested' }, '*');
    }

    self.sharePageRequested = function () {
        parent.postMessage({ command: 'sharePageRequested' }, '*');
    }

    self.getPasswordCharacter = function (i) {
        if (self.password().length < i) {
            return '';
        }
        return this.password().substr(i - 1, 1);
    };

    self.copyToClipboard = function () {
        self.copiedToClipboard(true);
        self.password(encodePassword(self.phrase(), self.selectedProfile().pin1 + self.selectedProfile().pin2 + self.selectedProfile().pin3 + self.selectedProfile().pin4, self.selectedProfile().includeSymbols, self.selectedProfile().caseSensitive, self.selectedProfile().passwordLength));
        var message = {
            command: 'copyPasswordToClipboard',
            context: { password: self.password() }
        };
        parent.postMessage(message, '*');
        self.notifyAnalyticsEvent('Copied');
    };

    self.buttonsEnabled = ko.computed(function () {
        return self.phrase().length >= self.minimumPhraseLength;
    });

    self.inputPhraseType = ko.computed(function () {
        return self.showPhrase() ? 'text' : 'password';
    });

    self.remainingChars = ko.computed(function () {
        switch (self.phrase().length) {
            case 0:
                return 'Enter at least ' + self.minimumPhraseLength + ' characters';
            case self.minimumPhraseLength - 1:
                return 'Enter at least 1 more character';
            default:
                return 'Enter at least ' + (self.minimumPhraseLength - self.phrase().length) + ' more characters';
        }
    });

    self.passwordGenerated = ko.computed(function () {
        return self.password().length > 0;
    });

    self.notifyAnalyticsEvent = function (method) {
        var message = {
            command: 'passwordGenerated',
            context: { selectedProfile: self.selectedProfile(), method: method }
        };
        parent.postMessage(message, '*');
    }
};

function main(deadboltSettings) {
    var viewModel = new deadbolt(deadboltSettings);
    ko.applyBindings(viewModel);
}

document.addEventListener('DOMContentLoaded', function () {
    var message = {
        command: 'loaded'
    };
    parent.postMessage(message, '*');
});
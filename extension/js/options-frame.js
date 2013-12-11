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
        case 'deadboltSettings':
            main(event.data.context.deadboltSettings);
            break;
    }
}, false);

function profile(name, includeSymbols, caseSensitive, usePinNumber, pin1, pin2, pin3, pin4, passwordLength, parent) {
    var self = this;
    self.name = ko.observable(name);
    self.includeSymbols = ko.observable(includeSymbols);
    self.caseSensitive = ko.observable(caseSensitive);
    self.usePinNumber = ko.observable(usePinNumber);
    self.pin1 = ko.observable(pin1);
    self.pin2 = ko.observable(pin2);
    self.pin3 = ko.observable(pin3);
    self.pin4 = ko.observable(pin4);
    self.passwordLength = ko.observable(passwordLength);
    self.parent = parent;

    self.pinNumber = ko.computed(function () {
        return self.pin1() + self.pin2() + self.pin3() + self.pin4();
    }, self);

    self.toggleIncludeSymbols = function (data, event) {
        self.includeSymbols(self.toggle(event.srcElement.outerText));
    };

    self.toggleCaseSensitive = function (data, event) {
        self.caseSensitive(self.toggle(event.srcElement.outerText));
    };

    self.toggleUsePinNumber = function (data, event) {
        self.usePinNumber(self.toggle(event.srcElement.outerText));
    };

    self.toggle = function (val) {
        return val == 'Yes' ? true : false;
    };

    self.markChange = function () {
        parent.changesMade(true);
    };

    self.name.subscribe(function() { self.markChange(); });
    self.includeSymbols.subscribe(function () { self.markChange(); });
    self.passwordLength.subscribe(function () { self.markChange(); });
    self.caseSensitive.subscribe(function () { self.markChange(); });
    self.usePinNumber.subscribe(function () { self.markChange(); });
    self.pin1.subscribe(function () { self.markChange(); });
    self.pin2.subscribe(function () { self.markChange(); });
    self.pin3.subscribe(function () { self.markChange(); });
    self.pin4.subscribe(function () { self.markChange(); });
}

function deadboltSettingsViewModel(defaultProfileName) {
    var self = this;
    self.defaultProfileName = ko.observable(defaultProfileName)
    self.profiles = ko.observableArray();
    self.changesMade = ko.observable(false);
    self.createProfile = function () {
        var p = new profile('Profile ' + (self.profiles().length + 1), false, false, false, '0', '0', '0', '0', 15, this);
        self.profiles.push(p);
        $('#profileTabs a:last').tab('show');
        self.changesMade(true);
    };
    self.addProfile = function (p) {
        self.profiles.push(p);
    };
    self.removeProfile = function (profile, i) {
        self.changesMade(true);
        self.profiles.remove(profile);
        var newSelectedTab = 0;
        if ($("#profileTabs li").size() == i) {
            newSelectedTab = $('#profileTabs a:last');
        }
        else {
            newSelectedTab = $('#profileTabs li:eq(' + (i) + ') a')
        }
        newSelectedTab.tab('show');
    };
    self.save = function () {
        
        var simpleProfileList = new Array();

        for (var i = 0; i < self.profiles().length; i++) {
            var p = self.profiles()[i];
            simpleProfileList.push(new simpleProfile(p.name(), p.includeSymbols(), p.caseSensitive(), p.usePinNumber(), p.pin1(), p.pin2(), p.pin3(), p.pin4(), p.passwordLength()));
        }

        var settings = new deadboltSettings(self.defaultProfileName(), simpleProfileList);

        var message = {
            command: 'deadboltSettingsSaveRequest',
            context: { 'deadboltSettings': settings }
        };
        parent.postMessage(message, '*');
        self.changesMade(false);
    };
    self.defaultProfileName.subscribe(function () { self.changesMade(true); });
}

function main(deadboltSettings) {
    
    var viewModel = new deadboltSettingsViewModel(deadboltSettings.defaultProfileName);
    for (var i = 0; i < deadboltSettings.simpleProfileList.length; i++) {
        var p = deadboltSettings.simpleProfileList[i];
        viewModel.addProfile(new profile(p.name, p.includeSymbols, p.caseSensitive, p.usePinNumber, p.pin1, p.pin2, p.pin3, p.pin4, p.passwordLength, viewModel));
    }

    ko.applyBindings(viewModel);
    $('#profileTabs a:first').tab('show'); 
}

document.addEventListener('DOMContentLoaded', function () {
    var message = {
        command: 'loaded'
    };
    parent.postMessage(message, '*');
});
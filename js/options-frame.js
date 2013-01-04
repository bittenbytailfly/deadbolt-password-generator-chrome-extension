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
        case 'profiles':
            main(event.data.context.profileList);
            break;
    }
}, false);

function profile(name, includeSymbols, maskPhrase, caseSensitive, usePinNumber, pin1, pin2, pin3, pin4) {
    var self = this;
    self.name = ko.observable(name);
    self.includeSymbols = ko.observable(includeSymbols);
    self.maskPhrase = ko.observable(maskPhrase);
    self.caseSensitive = ko.observable(caseSensitive);
    self.usePinNumber = ko.observable(usePinNumber);
    self.pin1 = ko.observable(pin1);
    self.pin2 = ko.observable(pin2);
    self.pin3 = ko.observable(pin3);
    self.pin4 = ko.observable(pin4);

    self.pinNumber = ko.computed(function () {
        return self.pin1() + self.pin2() + self.pin3() + self.pin4();
    }, self);

    self.toggleIncludeSymbols = function (data, event) {
        self.includeSymbols(self.toggle(event.srcElement.outerText));
    };

    self.toggleMaskPhrase = function (data, event) {
        self.maskPhrase(self.toggle(event.srcElement.outerText));
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
}

function profileSelection() {
    var self = this;
    self.profiles = ko.observableArray();
    self.createProfile = function () {
        var p = new profile('Profile ' + (self.profiles().length + 1), false, false, false, false, '0', '0', '0', '0');
        self.profiles.push(p);
        $('#profileTabs a:last').tab('show');
    };
    self.addProfile = function (p) {
        self.profiles.push(p);
    };
    self.save = function () {
        var simpleProfileList = new Array();

        for (var i = 0; i < self.profiles().length; i++) {
            var p = self.profiles()[i];
            simpleProfileList.push(new simpleProfile(p.name(), p.includeSymbols(), p.maskPhrase(), p.caseSensitive(), p.usePinNumber(), p.pin1(), p.pin2(), p.pin3(), p.pin4()));
        }
        
        var message = {
            command: 'profileSaveRequest',
            context: { profiles: simpleProfileList }
        };
        parent.postMessage(message, '*');
    };
}

function main(profiles) {
    var viewModel = new profileSelection();

    for (var i = 0; i < profiles.length; i++) {
        var p = profiles[i];
        viewModel.addProfile(new profile(p.name, p.includeSymbols, p.maskPhrase, p.caseSensitive, p.usePinNumber, p.pin1, p.pin2, p.pin3, p.pin4));
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
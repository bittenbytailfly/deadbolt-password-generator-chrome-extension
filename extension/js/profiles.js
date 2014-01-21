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

function deadboltSettings(defaultProfileName, simpleProfileList) {
    this.defaultProfileName = defaultProfileName;
    this.simpleProfileList = simpleProfileList;
}

function simpleProfile(name, includeSymbols, caseSensitive, usePinNumber, pin1, pin2, pin3, pin4, passwordLength) {
    this.name = name;
    this.includeSymbols = includeSymbols;
    this.caseSensitive = caseSensitive;
    this.usePinNumber = usePinNumber;
    this.pin1 = pin1;
    this.pin2 = pin2;
    this.pin3 = pin3;
    this.pin4 = pin4;
    this.passwordLength = passwordLength;
}

function createDefaultDeadboltSettings() {
    var simpleProfileList = new Array();
    var defaultSimpleProfile = new simpleProfile('Default', true, true, false, '0', '0', '0', '0', 15);
    simpleProfileList.push(defaultSimpleProfile);
    var settings = new deadboltSettings('Default', simpleProfileList);
    saveDeadboltSettings(settings);
    return settings;
}

function retrieveDeadboltSettings(callback) {
    chrome.storage.sync.get('deadboltSettings', function (r) {
        var savedSettings = r.deadboltSettings;
        if (!savedSettings) {
            savedSettings = createDefaultDeadboltSettings();
        }
        callback(savedSettings);
    });
}

function saveDeadboltSettings(deadboltSettings, callback) {
    deadboltSettings.simpleProfileList.sort(function (a, b) { return a.name.localeCompare(b.name); });
    chrome.storage.sync.set({ 'deadboltSettings': deadboltSettings }, function () {
        if (callback != null) {
            callback();
        }
    });
}

function selectNode(node) {
    var selection, range, doc, win;

    if ((doc = node.ownerDocument) && (win = doc.defaultView) && typeof 
            win.getSelection != 'undefined' && typeof doc.createRange !=
            'undefined' && (selection = window.getSelection()) && typeof 
            selection.removeAllRanges != 'undefined') {
        range = doc.createRange();
        range.selectNode(node);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    else if (document.body && typeof document.body.createTextRange !=
            'undefined' && (range = document.body.createTextRange())) {
        range.moveToElementText(node);
        range.select();
    }
}

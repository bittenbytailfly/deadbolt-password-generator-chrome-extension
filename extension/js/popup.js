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
        case 'loaded':
            retrieveDeadboltSettings(settingsLoaded);
            break;
        case 'settingsChangeRequested':
            chrome.tabs.create({
                url: 'options.htm'
            });
            window.close();
            break;
        case 'aboutPageRequested':
            chrome.tabs.create({
                url: 'http://www.deadboltpasswordgenerator.com/'
            });
            break;
        case 'copyPasswordToClipboard':
            var message = {
                command: 'copyPasswordToClipboard',
                context: { password: event.data.context.password }
            };
            chrome.extension.getBackgroundPage().postMessage(message, '*');
            break;
        case 'passwordGenerated':
            var eventLabel = generateEventLabel(event.data.context.selectedProfile);
            _gaq.push(['_trackEvent', 'Password Generated', event.data.context.method, eventLabel]);
    }
}, false);

function generateEventLabel(profile) {
    return 'Symbols:' + profile.includeSymbols +
        '|Length:' + profile.passwordLength +
        '|CaseSensitive:' + profile.caseSensitive +
        '|UsePin:' + profile.usePinNumber;
}

function settingsLoaded(deadboltSettings) {
    var iframe = parent.document.getElementById('popupFrame');
    var message = {
        command: 'settings',
        context: { 'deadboltSettings': deadboltSettings }
    };
    iframe.contentWindow.postMessage(message, '*');
    chrome.extension.getBackgroundPage().postMessage({
        command: 'initialize'
    }, '*');
}
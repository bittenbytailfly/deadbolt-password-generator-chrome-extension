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
        case 'copyPasswordToClipboard':
            setClipboardValue(event.data.context.password);
            startCountdown();
            break;
        case 'initialize':
            chrome.browserAction.setBadgeBackgroundColor({ color: '#00f' });
            chrome.browserAction.setBadgeText({ text: '' });
            break;
        case 'clearClipboard':
            setClipboardValue(' ');
            chrome.browserAction.setBadgeText({ text: '' });
            break;
    }
}, false);

function setClipboardValue(text) {
    var txt = document.createElement('textarea');
    txt.value = text;
    document.body.appendChild(txt);
    txt.select();
    document.execCommand('Copy');
    document.body.removeChild(txt);
}

var countdownTimer = 0;

function startCountdown() {
    countdownTimer = 10;
    decreaseCounter();
}

function decreaseCounter() {
    var displayNumber = '0' + countdownTimer;
    displayNumber = displayNumber.substr(displayNumber.length - 2);
    chrome.browserAction.setBadgeText({ text: '' + displayNumber });
    countdownTimer--;
    if (countdownTimer >= 0) {
        setTimeout(decreaseCounter, 1000);
    }
    else {
        window.postMessage({
            command: 'clearClipboard'
        }, '*');
    }
}
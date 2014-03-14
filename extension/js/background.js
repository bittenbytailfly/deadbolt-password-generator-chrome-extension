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

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
      var cmd = request.command;
      var password = request.password;
      switch (cmd) {
          case 'copyPasswordToClipboard':
              setClipboardValue(password);
              decreaseCounter(10);
              break;
          case 'injectPassword':
              chrome.tabs.query({ active: true }, function (tabs) {
                  chrome.tabs.sendMessage(tabs[0].id, { command: 'inject', password: password }, function(r) {
                       console.log(r);
                  });
              });
              break;
      }
  });

function setClipboardValue(text) {
    var txt = document.createElement('textarea');
    txt.value = text;
    document.body.appendChild(txt);
    txt.select();
    document.execCommand('Copy');
    document.body.removeChild(txt);
}

function decreaseCounter(counter) {
    var displayNumber = '0' + counter;
    displayNumber = displayNumber.substr(displayNumber.length - 2);
    chrome.browserAction.setBadgeText({ text: '' + displayNumber });
    counter--;
    if (counter >= 0) {
        setTimeout(function() { decreaseCounter(counter); }, 1000);
    }
    else {
        setClipboardValue(' ');
        chrome.browserAction.setBadgeText({ text: '' });
    }
}
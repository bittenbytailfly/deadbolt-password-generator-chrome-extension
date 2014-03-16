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

function injectPasswords(password) {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type.toLowerCase() === "password") {
            var pwBox = inputs[i];
            pwBox.value = password;
            pwBox.style.backgroundImage = "url('" + chrome.extension.getURL('img/injected-bg-icon.png') + "')";
            pwBox.style.backgroundSize = 'contain';
            pwBox.style.backgroundRepeat = 'no-repeat';
            pwBox.style.backgroundPositionX = 'right';
            var event = document.createEvent("UIEvents");
            event.initUIEvent("change", true, true);
            pwBox.dispatchEvent(event);
        }
    }
};

function checkPasswordFieldsExist() {
    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type.toLowerCase() === "password") {
            return true;
        }
    }
    return false;
}

chrome.extension.onMessage.addListener(function (request, sender, callback) {
    var cmd = request.command;
    switch (cmd) {
        case 'inject':
            var data = request.data;
            injectPasswords(data.password);
            callback();
            break;
        case 'checkPasswordInputAvailable':
            callback({ available: checkPasswordFieldsExist() });
            break;
    }
});
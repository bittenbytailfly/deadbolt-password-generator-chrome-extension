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
            retrieveProfiles(profilesLoaded);
            break;
        case 'profileSaveRequest':
            saveProfiles(event.data.context.profiles, profilesSaved);
            break;
    }
}, false);

function profilesLoaded(profiles) {
    console.log(profiles);
    var iframe = parent.document.getElementById('optionsFrame');
    var message = {
        command: 'profiles',
        context: { profileList: profiles }
    };
    iframe.contentWindow.postMessage(message, '*');
}

function profilesSaved() {
    console.log('do something clever here ...');
}
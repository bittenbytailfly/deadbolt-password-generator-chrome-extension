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
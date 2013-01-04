// Set up message event handler:
window.addEventListener('message', function (event) {
    var command = event.data.command;
    switch (command) {
        case 'loaded':
            retrieveProfiles(profilesLoaded);
            break;
        case 'settingsChangeRequested':
            chrome.tabs.create({
                url: 'options.htm'
            });
            window.close();
            break;
        case 'aboutPageRequested':
            chrome.tabs.create({
                url: 'http://www.deadboltpasswordgenerator.com/faq'
            });
            break;
        case 'copyPasswordToClipboard':
            console.log('eventpage');
            var message = {
                command: 'copyPasswordToClipboard',
                context: { password: event.data.context.password }
            };
            console.log(chrome.extension.getBackgroundPage());
            chrome.extension.getBackgroundPage().postMessage(message, '*');
            break;
    }
}, false);

function profilesLoaded(profiles) {
    var iframe = parent.document.getElementById('popupFrame');
    var message = {
        command: 'profiles',
        context: { profileList: profiles }
    };
    iframe.contentWindow.postMessage(message, '*');
    chrome.extension.getBackgroundPage().postMessage({
        command: 'initialize'
    }, '*');
}
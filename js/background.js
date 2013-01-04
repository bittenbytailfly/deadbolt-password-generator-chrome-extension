// Set up message event handler:
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

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.set({ name: 'Bob' }, function () {
        console.log('Name saved');
    });

    // Later on...
    chrome.storage.local.get('name', function (r) {
        console.log('Name retrieved: ' + r['name']);
    });
    
    chrome.storage.local.set({ name: 'Bob' }, function () {
        console.log('Name saved');
    });

    chrome.storage.local.get('name', function (r) {
        console.log('Name retrieved: ' + r['name']);
    });
});
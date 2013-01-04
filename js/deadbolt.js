function simpleProfile(name, includeSymbols, maskPhrase, caseSensitive, usePinNumber, pin1, pin2, pin3, pin4) {
    this.name = name;
    this.includeSymbols = includeSymbols;
    this.maskPhrase = maskPhrase;
    this.caseSensitive = caseSensitive;
    this.usePinNumber = usePinNumber;
    this.pin1 = pin1;
    this.pin2 = pin2;
    this.pin3 = pin3;
    this.pin4 = pin4;
}

function createDefaultProfileList() {
    var simpleProfileList = new Array();
    var defaultSimpleProfile = new simpleProfile('Default', false, false, false, false, '0', '0', '0', '0');
    simpleProfileList.push(defaultSimpleProfile);
    saveProfiles(simpleProfileList);
    return simpleProfileList;
}

var savedProfileJson;

function retrieveProfiles(callback) {
    chrome.storage.sync.get('profileList', function (r) {
        var savedProfileJson = r.profileList;
        if (!savedProfileJson || !savedProfileJson[0] || !savedProfileJson[0].name) {
            savedProfileJson = createDefaultProfileList();
        }

        var savedProfiles = new Array();
        for (var i = 0; i < savedProfileJson.length; i++) {
            var p = savedProfileJson[i];
            savedProfiles.push(new simpleProfile(p.name, p.includeSymbols, p.maskPhrase, p.caseSensitive, p.usePinNumber, p.pin1, p.pin2, p.pin3, p.pin4));
        }
        callback(savedProfiles);
    });
}

function saveProfiles(profiles, callback) {
    console.log('attempting save');
    chrome.storage.sync.set({ profileList: profiles }, function () {
        if (callback != null) {
            callback();
        }
    });
}

function encodePassword(passPhrase, pin, useSpecial, caseSensitive) {
    if (!caseSensitive) {
        passPhrase = passPhrase.toLowerCase();
    }

    var multiplier = pin + '669.669',
        specialChars = '!\"$%^&*()',
        numericChars = '0123456789',
        ucaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lcaseChars = 'abcdefghijklmnopqrstuvwxyz',
        passNumber = 0,
        password = "",
        i;

    while (passPhrase.length < 15) {
        passPhrase += passPhrase;
    }

    for (i = 0; i < passPhrase.length; i += 1) {
        var passChar = passPhrase.charCodeAt(i),
            passCharRnd = (passChar / multiplier).toFixed(5),
            passPart = (passCharRnd + '').split('.')[1];
        passNumber = (passNumber * 1) + (passPart * 1);
        if ((passNumber + '').length < 15) {
            passNumber = passNumber + '' + i;
        }
    }

    for (i = 0; i < 15; i += 1) {
        var index = (passNumber + '').substr(i, 5),
            charsToUse;

        if (useSpecial && (i % 7 === 6)) {
            charsToUse = specialChars;
        } else if (i % 4 === 0) {
            charsToUse = numericChars;
        } else if (i % 3 !== 0) {
            charsToUse = lcaseChars;
        } else {
            charsToUse = ucaseChars;
        }

        var arrayMarker = index % charsToUse.length;
        password += charsToUse.charAt(arrayMarker);
    }

    return password;
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

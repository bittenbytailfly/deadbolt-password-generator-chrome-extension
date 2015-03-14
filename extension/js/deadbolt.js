/*
 Deadbolt Password Generator v2.0
 Copyright (c) 2009-2015 Ed Carter http://www.deadboltpasswordgenerator.com
 License: MIT
*/

var deadboltPasswordGenerator = (function() {

    var self = this;

    self.specialChars = '!\"$%^&*()';
    self.numericChars = '0123456789';
    self.ucaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    self.lcaseChars = 'abcdefghijklmnopqrstuvwxyz';

    self.getNumericPasswordString = function(passPhrase, multiplier, options) {
        var passNumber = 0;

        while (passPhrase.length < options.passwordLength) {
            passPhrase += passPhrase;
        }

        for (var i = 0; i < passPhrase.length; i += 1) {
            var passChar = passPhrase.charCodeAt(i);
            var passCharRnd = (passChar / multiplier).toFixed(5);
            var passPart = (passCharRnd + '').split('.')[1];
            var passNumber = (passNumber * 1) + (passPart * 1);
            if ((passNumber + '').length < options.passwordLength) {
                passNumber = passNumber + '' + i;
            }
        }

        return passNumber;
    };

    self.v1Encode = function(passPhrase, multiplier, options) {
        var password = '';
        var passNumber = self.getNumericPasswordString(passPhrase, multiplier, options);

        for (var i = 0; i < options.passwordLength; i += 1) {
            var index = (passNumber + '').substr(i, 5),
                charsToUse;

            if (options.useSpecial && (i % 7 === 6)) {
                charsToUse = self.specialChars;
            }
            else if (i % 4 === 0) {
                charsToUse = self.numericChars;
            }
            else if (i % 3 !== 0) {
                charsToUse = self.lcaseChars;
            }
            else {
                charsToUse = self.ucaseChars;
            }

            var arrayMarker = index % charsToUse.length;
            password += charsToUse.charAt(arrayMarker);
        }

        return password;
    };

    self.v2Encode = function(passPhrase, multiplier, options) {
        var password = '';
        var passNumber = self.getNumericPasswordString(passPhrase, multiplier, options);

        var charMarker = (passNumber + '').substring(5, 6);

        var splicedPassNumber = new Array();
        var passNumberArray = (passNumber + '').split('');
        var passNumberLength = (passNumber + '').length;
        for (var i = 0; i < passNumberLength; i++) {
            splicedPassNumber.push(passNumberArray[i]);
            if ((charMarker + i) % 2 == 0) {
                splicedPassNumber.push(passNumberArray[passNumberLength - i]);
            }
        }
        passNumber = splicedPassNumber.join('');

        var symbolInsert1 = passNumber % 15;
        var symbolInsert2 = passNumber % 7;

        if (symbolInsert1 == symbolInsert2) {
            symbolInsert1 += 2;
            if (symbolInsert1 > options.passwordLength) {
                symbolInsert1 = 0;
            }
        }

        for (var i = 0; i < options.passwordLength; i += 1) {
            var index = (passNumber + '').substr(i, 5),
                charsToUse;

            if (options.useSpecial && (i === symbolInsert1 || i === symbolInsert2)) {
                charsToUse = self.specialChars;
            }
            else if ((charMarker + i) % 4 === 0) {
                charsToUse = self.numericChars;
            }
            else if ((charMarker + i) % 3 !== 0) {
                charsToUse = self.lcaseChars;
            }
            else {
                charsToUse = self.ucaseChars;
            }

            var arrayMarker = index % charsToUse.length;
            password += charsToUse.charAt(arrayMarker);
        }

        return password;
    };

    self.engines = new Array({
        id: 0,
        name: 'English Breakfast (legacy)',
        process: function(passPhrase, options) {
            var multiplier = options.pin + '669.669'
            return self.v1Encode(passPhrase, multiplier, options);
        }
    }, {
        id: 1,
        name: 'Earl Grey',
        process: function(passPhrase, options) {
            var multiplier = '669.' + options.pin;
            return self.v2Encode(passPhrase, multiplier, options);
        }
    }, {
        id: 2,
        name: 'Cammomile',
        process: function(passPhrase, options) {
            var multiplier = '66.9' + options.pin.split('').reverse().join('');
            return self.v2Encode(passPhrase, multiplier, options);
        }
    });

    self.getEngineById = function(id) {
        for (var i = 0; i < self.engines.length; i++) {
            if (self.engines[i].id === id) {
                return self.engines[i];
            }
        }
        return null;
    };

    return {
        getAvailableEngines: function() {
            return self.engines;
        },
        encodePassword: function(passPhrase, options) {
            if (passPhrase.length < 6) {
                return '';
            }

            if (!options.caseSensitive) {
                passPhrase = passPhrase.toLowerCase();
            }

            var engineId = options.engineId || 0;
            var passwordOptions = {
                pin: options.pin || '0000',
                useSpecial: options.useSpecial === undefined ? true : options.useSpecial,
                passwordLength: options.passwordLength || 15
            };

            var engine = self.getEngineById(engineId);
            if (!engine) {
                return '';
            }
            return engine.process(passPhrase, passwordOptions);
        }
    };
})();
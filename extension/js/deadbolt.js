//    Copyright 2009-2013 Ed Carter
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

function encodePassword(passPhrase, pin, useSpecial, caseSensitive, passwordLength) {
    
    if (!passwordLength) {
        passwordLength = 15;
    }
    
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

    while (passPhrase.length < passwordLength) {
        passPhrase += passPhrase;
    }

    for (i = 0; i < passPhrase.length; i += 1) {
        var passChar = passPhrase.charCodeAt(i),
            passCharRnd = (passChar / multiplier).toFixed(5),
            passPart = (passCharRnd + '').split('.')[1];
        passNumber = (passNumber * 1) + (passPart * 1);
        if ((passNumber + '').length < passwordLength) {
            passNumber = passNumber + '' + i;
        }
    }

    for (i = 0; i < passwordLength; i += 1) {
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
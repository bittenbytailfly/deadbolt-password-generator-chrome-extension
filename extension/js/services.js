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

'use strict';

angular.module('deadboltPasswordGeneratorApp.services', [])
    .factory('settingsRepository', function (deadboltSettingsFactory) {
        return {
            getSettings: function (callback) {
                var self = this;
                var requiresSave = false;
                chrome.storage.sync.get('deadboltSettings', function (r) {
                    var requiresSave = false;
                    var savedSettings = r.deadboltSettings;
                    if (!savedSettings) {
                        savedSettings = deadboltSettingsFactory.createDefaultDeadboltSettings();
                        requiresSave = true;
                    }
                    // New features added so set defaults here if not already created.
                    if (savedSettings.clipboardSettings == null) {
                        savedSettings.clipboardSettings = new deadboltSettingsFactory.clipboardSettings(true, 10);
                        requiresSave = true;
                    }
                    if (savedSettings.enterKeySettings == null) {
                        savedSettings.enterKeySettings = new deadboltSettingsFactory.enterKeySettings(false, 'AR');
                        requiresSave = true;
                    }
                    if (requiresSave) {
                        self.saveSettings(savedSettings);
                    }
                    savedSettings.simpleProfileList = deadboltSettingsFactory.decontaminate(savedSettings.simpleProfileList);
                    callback(savedSettings, null);
                });
            },
            saveSettings: function (deadboltSettings, callback) {
                deadboltSettings.simpleProfileList.sort(function (a, b) { return a.name.localeCompare(b.name); });
                deadboltSettings.simpleProfileList = deadboltSettingsFactory.decontaminate(deadboltSettings.simpleProfileList);
                chrome.storage.sync.set({ 'deadboltSettings': deadboltSettings }, function () {
                    if (callback != null) {
                        callback();
                    }
                });
            }
        };
    })
    .factory('analyticsService', function () {
        return {
            generateEventLabel: function (p) {
                return 'EngineId' + p.engineId +
                    '|Symbols:' + p.includeSymbols +
                    '|Length:' + p.passwordLength +
                    '|CaseSensitive:' + p.caseSensitive +
                    '|UsePin:' + p.usePinNumber;
            },
            postEvent: function (method, selectedProfile) {
                var eventLabel = this.generateEventLabel(selectedProfile);
                _gaq.push(['_trackEvent', 'Password Generated', method, eventLabel]);
            }
        };
    })
    .factory('deadboltSettingsFactory', function () {
        return {
            createDefaultDeadboltSettings: function () {
                var simpleProfileList = new Array();
                simpleProfileList.push(this.createDefaultProfile('Default'));
                var clipboardSettings = new this.clipboardSettings(true, 10);
                var enterKeySettings = this.enterKeySettings(false, 'AR');
                var settings = new this.deadboltSettings('Default', simpleProfileList, clipboardSettings, enterKeySettings);
                return settings;
            },
            deadboltSettings: function (defaultProfileName, simpleProfileList, clipboardSettings, enterKeySettings) {
                this.defaultProfileName = defaultProfileName;
                this.simpleProfileList = simpleProfileList;
                this.clipboardSettings = clipboardSettings;
                this.enterKeySettings = enterKeySettings;
            },
	        clipboardSettings: function (enabled, seconds) {
                this.enabled = enabled;
                this.seconds = seconds;
            },
	        enterKeySettings: function(enabled, behaviour) {
                this.enabled = enabled;
                this.behaviour = behaviour;
            },
	        simpleProfile: function (name, engineId, includeSymbols, caseSensitive, usePinNumber, pin1, pin2, pin3, pin4, passwordLength) {
	            this.name = name;
	            this.engineId = engineId;
                this.includeSymbols = includeSymbols;
                this.caseSensitive = caseSensitive;
                this.usePinNumber = usePinNumber;
                this.pin1 = pin1;
                this.pin2 = pin2;
                this.pin3 = pin3;
                this.pin4 = pin4;
                this.passwordLength = passwordLength;
            },
            createDefaultProfile: function (name) {
                return new this.simpleProfile(name, 1, true, true, false, '0', '0', '0', '0', 15);
            },
            findMatchingProfileByName: function (profiles, name) {
                for (var i = 0; i < profiles.length; i++) {
                    if (profiles[i].name == name) {
                        return profiles[i]
                    }
                }
                return profiles[0];
            },
            decontaminate: function (array) {
                var json = angular.toJson(array);
                return angular.fromJson(json);
            }
        };
    });

'use strict';

var Status = require('dw/system/Status');

/**
 * This job allows you to update your Bridge settings.
 * Your Bridge settings are in your Bridge GPT custom preferences.
 * This job updates your settings PER INSTANCE. That means if you run it in Dev, it will update Dev but not other environments.
 * Updating a new environment requires a job run in that environment.
 * @returns {dw.system.Status} The exit status for the job step
 */
var run = function () {
    var BridgeService = require('*/cartridge/scripts/services/BridgeService');
    var updateSettingsStatus = BridgeService.exportBridgeSettings();

    if (updateSettingsStatus.ok) {
        return new Status(Status.OK, 'OK', 'Your Bridge settings are now updated');
    }

    return new Status(Status.ERROR, 'ERROR', 'Communicating with Bridge GPT failed with error message: ' + updateSettingsStatus.errorMessage);
};

exports.Run = run;

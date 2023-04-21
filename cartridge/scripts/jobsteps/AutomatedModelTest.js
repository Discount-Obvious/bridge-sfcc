'use strict';

var Status = require('dw/system/Status');
var Site = require('/dw/system/Site');

/**
 * The main function.
 *
 * @returns {dw.system.Status} The exit status for the job step
 */
var run = function () {
    var testSettings = Site.getCurrent().getCustomPreferenceValue('bgpt_testSettings');
    if (!testSettings || testSettings === '') {
        return new Status(Status.ERROR, 'ERROR', 'bgpt_testSettings is not set. Please set your test settings in your custom preferences.');
    }

    try {
        JSON.parse(testSettings);
    } catch (e) {
        return new Status(Status.ERROR, 'ERROR', 'Invalid JSON in bgpt_testSettings. Please check your test settings in your custom preferences.');
    }

    var BridgeService = require('*/cartridge/scripts/services/BridgeService');
    var testExecutionStatus = BridgeService.automatedTest();

    if (testExecutionStatus.ok) {
        return new Status(Status.OK, 'OK', 'Test started. You will receive an email when the test is complete.');
    }

    return new Status(Status.ERROR, 'ERROR', 'Communicating with Bridge GPT failed with error message: ' + testExecutionStatus.errorMessage);
};

exports.Run = run;

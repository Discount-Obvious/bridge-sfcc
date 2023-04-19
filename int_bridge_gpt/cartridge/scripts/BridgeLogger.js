'use strict';

var Logger = require('dw/system/Logger');

/**
 * BridgeLogger class manages Bridge error and debug logging.
 * @param {string} scriptFileName - name of the log file name
 */
function BridgeLogger(scriptFileName) {
    this.rootName = 'Bridge';
    this.scriptFileName = scriptFileName;
    this.log = Logger.getLogger(this.rootName, this.scriptFileName);
}

// eslint-disable-next-line valid-jsdoc
/**
 * Returns a properly formatted error message for the logger
 * @param {string} errorMessage - text of error message
 * @param {string} stackTrace - Optinonal where the error came from
 */
BridgeLogger.prototype.formatMessage = function (errorMessage, stackTrace) {
    var preface = this.rootName + '-' + this.scriptFileName + ', message: ';
    var logMessage = preface + errorMessage;
    if (stackTrace) {
        logMessage = logMessage + '; occurred at: ' + stackTrace;
    }

    return logMessage;
};

/**
 * Logs error messages for a given script.
 * @param {string} errorMessage - text of error message
 * @param {string} stackTrace - where the error came from
 */
BridgeLogger.prototype.error = function (errorMessage, stackTrace) {
    if (this.log.isErrorEnabled()) {
        var logMessage = this.formatMessage(errorMessage, stackTrace);
        this.log.error(logMessage);
    }
};

/**
 * Logs debug messages for a given script.
 * @param {string} debugMessage - text of debug message
 * @param {string} stackTrace - where the error came from
 */
BridgeLogger.prototype.debug = function (debugMessage, stackTrace) {
    if (this.log.isDebugEnabled()) {
        var logMessage = this.formatMessage(debugMessage, stackTrace);
        this.log.debug(logMessage);
    }
};

/**
 * Logs info messages for a given script.
 * @param {string} infoMessage - text of info message
 * @param {string} stackTrace - where the error came from
 */
BridgeLogger.prototype.info = function (infoMessage, stackTrace) {
    if (this.log.isInfoEnabled()) {
        var logMessage = this.formatMessage(infoMessage, stackTrace);
        this.log.info(logMessage);
    }
};

module.exports = BridgeLogger;

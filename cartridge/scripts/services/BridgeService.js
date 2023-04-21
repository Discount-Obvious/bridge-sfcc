
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Site = require('dw/system/Site');
var System = require('dw/system/System');
var BridgeLogger = require('*/cartridge/scripts/BridgeLogger');
var BridgeServiceHelpers = require('*/cartridge/scripts/helpers/bridgeServiceHelpers');
var BridgeHelpers = require('*/cartridge/scripts/helpers/bridgeHelpers');

var BridgeService = {
    /**
     * Authenticates the current user with the Bridge GPT service by sending an HTTP POST request with the user's credentials.
     *
     * @throws {Error} - Throws an error if the HTTP response status code is not 200 or 201.
     * @return {Object} - An object representing the HTTP response, containing the parsed response body and the status code.
     */
    authenticate: function () {
        var getAuthenticateService = LocalServiceRegistry.createService('bridge.auth.http', {
            createRequest: function (svc) {
                svc.setURL(svc.getURL());
                svc.addHeader('Content-Type', 'application/json');
                svc.setRequestMethod('POST');
                return BridgeServiceHelpers.getAuthenticationRequest(svc);
            },

            parseResponse: function (svc, response) {
                var responseObject = {};
                if (response.statusCode === 200 || response.statusCode === 201) {
                    responseObject = JSON.parse(response.text);
                } else {
                    var bridgeLogger = new BridgeLogger('authenticate');
                    bridgeLogger.error('Bridge Authenticate Service Errored with Status Code: ' + response.statusCode);
                    throw new Error('Bridge Authenticate Service Errored with Status Code: ' + response.statusCode);
                }

                responseObject.statusCode = response.statusCode;
                return responseObject;
            }
        });

        return getAuthenticateService.call();
    },
    automatedTest: function () {
        var execute = LocalServiceRegistry.createService('bridge.automatedTest.http', {
            createRequest: function (svc) {
                svc.setURL(svc.getURL());
                svc.addHeader('Content-Type', 'application/json');
                svc.setRequestMethod('POST');
                var serviceCredentials = svc.getConfiguration().credential;
                var rawTestSettings = Site.getCurrent().getCustomPreferenceValue('bgpt_testSettings');
                var jsonTestSettings = JSON.parse(rawTestSettings);
                jsonTestSettings.username = serviceCredentials.user;
                jsonTestSettings.password = serviceCredentials.password;
                return JSON.stringify(jsonTestSettings);
            },
            parseResponse: function (svc, response) {
                var responseObject = {};
                if (response.statusCode === 200 || response.statusCode === 201) {
                    responseObject.text = response.text;
                } else {
                    var bridgeLogger = new BridgeLogger('authenticate');
                    bridgeLogger.error('Automated Test Service Errored with Status Code: ' + response.statusCode);
                    throw new Error('Automated Test Service Errored with Status Code: ' + response.statusCode);
                }

                responseObject.statusCode = response.statusCode;
                return responseObject;
            }
        });

        return execute.call();
    },
    exportBridgeSettings: function () {
        var execute = LocalServiceRegistry.createService('bridge.exportBridgeSettings.http', {
            createRequest: function (svc) {
                svc.setURL(svc.getURL());
                svc.addHeader('Content-Type', 'application/json');
                svc.setRequestMethod('POST');
                var currentSite = Site.getCurrent();
                var serviceCredentials = svc.getConfiguration().credential;
                var dataPayload = {
                    instance: System.getInstanceType(), // 0 - SB, presumably dev as well. 1 = STG, 2 = PROD
                    hostname: System.getInstanceHostname(),
                    helpQuestionPrompt: currentSite.getCustomPreferenceValue('bgpt_helpQuestionPrompt'),
                    helpSystemPrompt: currentSite.getCustomPreferenceValue('bgpt_helpSystemPrompt'),
                    productQuestionPrompt: currentSite.getCustomPreferenceValue('bgpt_productQuestionPrompt'),
                    productSystemPrompt: currentSite.getCustomPreferenceValue('bgpt_productSystemPrompt'),
                    relevanceThreshold: currentSite.getCustomPreferenceValue('bgpt_relevanceThreshold'),
                    productRelevanceKeywords: BridgeHelpers.extractArrayFromSet('bgpt_productRelevanceKeywords'),
                    helpRelevanceKeywords: BridgeHelpers.extractArrayFromSet('bgpt_helpRelevanceKeywords'),
                    model: currentSite.getCustomPreferenceValue('bgpt_model'),
                    companyBackground: currentSite.getCustomPreferenceValue('bgpt_companyBackground'),
                    username: serviceCredentials.user,
                    password: serviceCredentials.password
                };
                return JSON.stringify(dataPayload);
            },
            parseResponse: function (svc, response) {
                var responseObject = {};
                if (response.statusCode === 200 || response.statusCode === 201) {
                    responseObject.text = response.text;
                } else {
                    var bridgeLogger = new BridgeLogger('exportBridgeSettings');
                    bridgeLogger.error('Export Bridge Settings Errored with Status Code: ' + response.statusCode);
                    throw new Error('Export Bridge Settings Errored with Status Code: ' + response.statusCode);
                }

                responseObject.statusCode = response.statusCode;
                return responseObject;
            }
        });

        return execute.call();
    }
};

module.exports = BridgeService;

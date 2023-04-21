'use strict';

var BridgeServiceHelpers = {
    /**
     * Generates an authentication request string for the provided service by extracting user and password credentials from its configuration.
     *
     * @param {Service} service - The service to generate the authentication request for.
     * @throws {Error} - Throws an error if the service configuration does not include valid user and password credentials.
     * @return {string} - The authentication request string in JSON format.
     */
    getAuthenticationRequest: function (service) {
        var body = {};
        var serviceCredentials = service.getConfiguration().credential;
        if (!serviceCredentials.user || !serviceCredentials.password) {
            throw new Error('Service configuration requires valid user and password');
        }

        body.username = serviceCredentials.user;
        body.password = serviceCredentials.password;

        return JSON.stringify(body);
    },
    parse: function (response) {
        return response.text;
    }
};

module.exports = BridgeServiceHelpers;

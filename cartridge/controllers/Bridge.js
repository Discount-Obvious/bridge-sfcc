var server = require('server');
var BridgeLogger = require('*/cartridge/scripts/BridgeLogger');
var ProductMgr = require('dw/catalog/ProductMgr');
var bridgeHelpers = require('*/cartridge/scripts/helpers/bridgeHelpers');
var BridgeService = require('*/cartridge/scripts/services/BridgeService');
var System = require('dw/system/System');

server.get('ProductData', function (req, res, next) {
    var bridgeLogger = new BridgeLogger('ProductData');
    var pid = req.querystring.pid;

    if (pid) {
        var product = ProductMgr.getProduct(pid);
        if (product) {
            var processedData = bridgeHelpers.pullProductData(product);
            res.json(processedData);
        } else {
            bridgeLogger.debug('Not able to find product: ' + pid);
            res.setStatusCode(400);
            res.json({ success: false, message: 'Sorry, not available right now' });
        }
    } else {
        bridgeLogger.error('No product ID in query string of request');
        res.setStatusCode(400);
        res.json({ success: false, message: 'Sorry, not available right now' });
    }

    next();
});

server.get('GetConversationToken', function (req, res, next) {
    var authResult = BridgeService.authenticate();

    if (authResult.ok && authResult.object) {
        res.json({
            success: true,
            accessToken: authResult.object.accessToken,
            refreshToken: authResult.object.refreshToken,
            instance: System.getInstanceType(),
            hostname: System.getInstanceHostname()
        });
    } else {
        res.json({ success: false, message: 'Sorry, not available right now' });
        var bridgeLogger = new BridgeLogger('GetConversationToken');
        bridgeLogger.error('Error getting conversation token: ' + JSON.stringify(authResult));
    }

    next();
});

module.exports = server.exports();

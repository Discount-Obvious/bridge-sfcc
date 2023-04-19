'use strict';

var BridgeLogger = require('*/cartridge/scripts/BridgeLogger');
var Site = require('dw/system/Site');

/**
 * Extracts an array of preference values from a Site custom preference set.
 *
 * @param {string} preferenceName - The name of the custom preference set to extract values from.
 * @returns {Array} An array containing the values extracted from the custom preference set.
 */
function extractArrayFromSet(preferenceName) {
    var convertedArray = [];
    var rawPreference = Site.getCurrent().getCustomPreferenceValue(preferenceName);
    if (rawPreference) {
        Object.keys(rawPreference).forEach(function (preferenceAttributeKey) {
            convertedArray.push(rawPreference[preferenceAttributeKey]);
        });
    }

    return convertedArray;
}

/**

Constructs a JSON object containing relevant information from a product object.
@param {dw.catalog.Product} product - The product object to extract information from.
@returns {Object} The product information in a JSON object format.
@throws {Error} Throws an error if an error occurs while extracting the product information.
*/
function pullProductData(product) {
    var bridgeLogger = new BridgeLogger('pullData');
    var productJSON = {};

    if (product.name) productJSON['Product Name'] = product.name;
    if (product.brand) productJSON.Brand = product.brand;
    if (product.longDescription || product.shortDescription) {
        productJSON['Product Description'] = product.longDescription || product.shortDescription;
    }

    // ID: womens-clothing-bottoms
    // product.primaryCategory.custom.bgpt_categoryBackground;
    if (product.primaryCategory) {
        productJSON.categoryID = product.primaryCategory.ID;
        if (product.primaryCategory.custom.bgpt_categoryBackground) { 
            productJSON.categoryBackground = product.primaryCategory.custom.bgpt_categoryBackground
        }
    }

    try {
        if (product.attributeModel) {
            product.attributeModel.getVisibleAttributeGroups().toArray().forEach(function (attributeGroup) {
                product.attributeModel.getVisibleAttributeDefinitions(attributeGroup).toArray().forEach(function (attributeDefinition) {
                    var attributeValue = product.attributeModel.getValue(attributeDefinition);
                    if (attributeValue) {
                        productJSON[attributeDefinition.displayName] = attributeValue;
                    }
                });
            });
        }
    } catch (e) {
        bridgeLogger.error(e.message, e.stack);
        return null;
    }

    var customProductAttributes = Site.getCurrent().getCustomPreferenceValue('bgpt_productAttributeAllowList');
    if (customProductAttributes) {
        Object.keys(customProductAttributes).forEach(function (productAttributeKey) {
            try {
                var key = customProductAttributes[productAttributeKey];
                productJSON[key] = product.custom[key];
            } catch (e) {
                bridgeLogger.debug(e.message, e.stack);
            }
        });
    }

    return productJSON;
}

module.exports = {
    pullProductData: pullProductData,
    extractArrayFromSet: extractArrayFromSet
};

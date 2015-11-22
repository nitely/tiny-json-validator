"use strict";

let validate = require('./validate');


/**
 * Validator object.
 * Delegation pattern.
 */
let proto = {};


/**
 * Validator initializer,
 * you must call it before
 * validate your data.
 *
 * Example:
 *     let validator = Object.create(proto);
 *     validator.init();
 *
 * @return {object} - Validator object
 * @api public
 */
proto.init = function init() {
    this.data = {};
    this.errors = {};
    this.path = [];
    return this;
};


/**
 * Recursive walk through
 * json schema and data.
 * Validates the node's *data*,
 * removes extra properties and
 * stores the path for error reporting.
 *
 * Example:
 *     validator.visit({root: schema}, {root: data});
 *
 * @param {object} parentNode - Schema node.
 * @param {object} data - Data node to validate.
 * @param {object} [opt] - Optional options.
 * @param {string} opt.nodeName - Internal Node's name.
 * @param {object|Array} [cleanedData] - Internal data node to save the valid data.
 * @param {object} cleanedData.root - Internal root Node.
 * @return {object} - Validator object
 * @api public
 */
proto.visit = function visit(parentNode, data, opt, cleanedData) {
    data = data || {};
    opt = opt || {};
    cleanedData = cleanedData || {};

    if (opt.nodeName)
        this.path.push(opt.nodeName);

    for (let name of Object.keys(parentNode)) {
        let node = parentNode[name];
        let n = validate(node, data, name, this.path, this.errors);

        if (!n.isValid())
            continue;

        if (typeof data[name] === 'undefined')
            continue;

        if (node.type == "object") {
            cleanedData[name] = {};
            this.visit(node.properties, data[name], {nodeName: name}, cleanedData[name]);
            continue;
        }

        if (node.type == "array") {
            cleanedData[name] = [];

            // TODO: for (let [index, item] of data[name].entries()) wont work on Node.js v4
            for (let index of data[name].keys()) {
                this.visit(
                    {[index]: node.items},  // Node schema
                    {[index]: data[name][index]},  // Node data
                    {nodeName: name},
                    cleanedData[name]
                );
            }

            continue;
        }

        if (Array.isArray(cleanedData))
            cleanedData.push(data[name]);
        else
            cleanedData[name] = data[name];
    }

    if (opt.nodeName)
        this.path.pop();

    if (this.path.length === 0)
        this.data = cleanedData.root;

    return this;
};


/**
 * Creates the validator and runs it.
 *
 * @param {object} schema - JSON schema.
 * @param {object} data - Data to validate.
 * @return {object}
 * @api public
 */
function validatorFactory(schema, data) {
    let validator = Object.create(proto)
        .init()
        .visit({root: schema}, {root: data});

    return {
        isValid: Object.keys(validator.errors).length === 0,
        errors: validator.errors,
        data: validator.data
    };
}


/**
 * Expose validator factory.
 */
module.exports = validatorFactory;


/**
 * Expose validator.
 */
module.exports.validator = proto;
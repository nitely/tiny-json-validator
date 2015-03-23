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
 * @api public
 */
proto.init = function init() {
    this.errors = {};
    this.path = [];
};


/**
 * Removes extra properties from data,
 * this modifies the original data object.
 *
 * @param {object} node
 * @param {object} data
 * @api private
 */
proto.removeExtraNodes = function removeExtraNodes(node, data) {
    let nodeNames = new Set(Object.keys(node));

    for (let name of Object.keys(data)) {
        if (!nodeNames.has(name)) {
            delete data[name];
        }
    }
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
 * @param {string} opt.nodeName - Node's name.
 * @api public
 */
proto.visit = function visit(parentNode, data, opt) {
    data = data || {};
    opt = opt || {};

    if (opt.nodeName) {
        this.path.push(opt.nodeName);
    }

    this.removeExtraNodes(parentNode, data);

    for (let name of Object.keys(parentNode)) {
        let node = parentNode[name];
        let n = validate(node, data, name, this.path, this.errors);

        if (!n.isValid()) {
            continue;
        }

        if (node.type == "object") {
            this.visit(node.properties, data[name], {nodeName: name});
        }

        if (node.type == "array") {
            // TODO: for (let [index, item] of data[name].entries()) wont work on iojs 1.6
            for (let index of data[name].keys()) {
                // TODO: {[index]: node.items, } requires --harmony_object_literals on iojs 1.6
                let nodeObj = {};
                let itemObj = {};
                nodeObj[index] = node.items;
                itemObj[index] = data[name][index];
                this.visit(nodeObj, itemObj, {nodeName: name});
            }
        }
    }

    if (opt.nodeName) {
        this.path.pop();
    }

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
    let validator = Object.create(proto);
    validator.init();
    validator.visit({root: schema}, {root: data});

    return {
        isValid: Object.keys(validator.errors).length === 0,
        errors: validator.errors
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
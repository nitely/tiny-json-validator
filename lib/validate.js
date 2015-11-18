"use strict";

let types = require('./types');
let formats = require('./formats');


/**
 * Validate object.
 * Delegation pattern.
 */
let proto = {};


/**
 * Validate initializer.
 *
 * Example:
 *     let validate = Object.create(proto);
 *     validate.init(node, data, name, path, errors);
 *
 * @param {object} node - Schema node.
 * @param {object} data - Data node to validate.
 * @param {string} name - Node's name.
 * @param {array} path - List of nodes to form the path.
 * @param {object} errors - Validation errors.
 * @api private
 */
proto.init = function init(node, data, name, path, errors) {
    this.node = node;
    this.data = data;
    this.name = name;
    this.path = path;
    this.errors = errors;
    this.value = data[name];
};


/**
 * Adds an error with its respective path.
 *
 * @param {string} error
 * @api private
 */
proto.addError = function addError(error) {
    let path = this.path.slice(1);  // Copy slicing out dummy root node
    path.push(this.name);
    let pathStr = path.join('.');
    this.errors[pathStr] = error;
};


/**
 * Checks the node is valid.
 *
 * @return {boolean}
 * @api private
 */
proto.isValid = function isValid() {
    // Required
    if (!this.isValidRequired()) {
        this.addError('is required');
        return false;
    }

    if (typeof this.value === 'undefined') {
        return true;
    }

    // Type
    if (!this.isValidType()) {
        this.addError(`type must be ${this.node.type}`);
        return false;
    }

    // Format
    if (!this.isValidFormat()) {
        this.addError(`format must be ${this.node.format}`);
        return false;
    }

    return true;
};


/**
 * Returns false if the node does not exists and is required.
 *
 * @return {boolean}
 * @api private
 */
proto.isValidRequired = function isValidRequired() {
    return !(typeof this.value === 'undefined' && this.node.required);
};


/**
 * Checks if the node's value is the correct type.
 *
 * @return {boolean}
 * @api private
 */
proto.isValidType = function isValidType() {
    let typeFunc = types[this.node.type];
    if( typeFunc == undefined ) return false;
    return typeFunc(this.value);
};


/**
 * Checks if the node's value is the correct format.
 *
 * @return {boolean}
 * @api private
 */
proto.isValidFormat = function isValidFormat() {
    if (!this.node.format) {
        return true;
    }

    let formatRegex = formats[this.node.format];
    return formatRegex.test(this.value);
};


/**
 * Creates the validate and runs it.
 *
 * @param {object} node
 * @param {object} data
 * @param {string} name
 * @param {array} path
 * @param {object} errors
 * @return {object}
 * @api public
 */
function validateFactory(node, data, name, path, errors) {
    let validate = Object.create(proto);
    validate.init(node, data, name, path, errors);
    return validate;
}


/**
 * Expose validate factory.
 */
module.exports = validateFactory;


/**
 * Expose validate.
 */
module.exports.validate = proto;

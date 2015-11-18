"use strict";

var validate = require('./validate');

/**
 * Validator object.
 * Delegation pattern.
 */
var proto = {};

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
    var nodeNames = new Set(Object.keys(node));

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(data)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var name = _step.value;

            if (!nodeNames.has(name)) {
                delete data[name];
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = Object.keys(parentNode)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var name = _step2.value;

            var node = parentNode[name];
            var n = validate(node, data, name, this.path, this.errors);

            if (!n.isValid()) {
                continue;
            }

            if (node.type == "object") {
                this.visit(node.properties, data[name], { nodeName: name });
            }

            if (node.type == "array") {
                // TODO: for (let [index, item] of data[name].entries()) wont work on iojs 1.6
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = data[name].keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var index = _step3.value;

                        // TODO: {[index]: node.items, } requires --harmony_object_literals on iojs 1.6
                        var nodeObj = {};
                        var itemObj = {};
                        nodeObj[index] = node.items;
                        itemObj[index] = data[name][index];
                        this.visit(nodeObj, itemObj, { nodeName: name });
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
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
    var validator = Object.create(proto);
    validator.init();
    validator.visit({ root: schema }, { root: data });

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
/*jslint node: true */
'use strict';

/*global module*/
module.exports = {
    toInt: function (str) {
        return parseInt(str, 10);
    },

    isString: function (value) {
        return typeof value === 'string';
    },

    isNumber: function (value) {
        return typeof value === 'number';
    },

    isDefined: function (value) {
        return typeof value !== 'undefined';
    },

    isUndefined: function (value) {
        return typeof value === 'undefined';
    },

    isObject: function (value) {
        return value !== null && typeof value === 'object';
    },

    isFunction: function (value) {
        return typeof value === 'function';
    },

    isBoolean: function (value) {
        return typeof value === 'boolean';
    },

    isArray: Array.isArray
};

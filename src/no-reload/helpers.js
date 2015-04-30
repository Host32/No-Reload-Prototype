/*global module*/
(function ($) {
    'use strict';

    function toInt(str) {
        return parseInt(str, 10);
    }

    function isString(value) {
        return typeof value === 'string';
    }

    function isNumber(value) {
        return typeof value === 'number';
    }

    function isDefined(value) {
        return typeof value !== 'undefined';
    }

    function isUndefined(value) {
        return typeof value === 'undefined';
    }

    function isObject(value) {
        return value !== null && typeof value === 'object';
    }

    function isWindow(obj) {
        return obj && obj.window === obj;
    }

    function isNull(value) {
        return value === null;
    }

    function isNonNull(value) {
        return value !== null;
    }

    function isFunction(value) {
        return typeof value === 'function';
    }

    function isBoolean(value) {
        return typeof value === 'boolean';
    }

    function isArray(value) {
        return Array.isArray(value);
    }

    function extend() {
        return $.extend.apply($, arguments);
    }

    module.exports = {
        toInt: toInt,
        isString: isString,
        isNumber: isNumber,
        isDefined: isDefined,
        isUndefined: isUndefined,
        isObject: isObject,
        isFunction: isFunction,
        isBoolean: isBoolean,
        isArray: isArray,
        extend: extend
    };

}(window.jQuery));

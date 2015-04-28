/**
 * Events class
 */
var Events = function () {
    'use strict';
    var events = this,
        registered = {
            beforeLoad: {},
            afterLoad: {}
        };

    /**
     * Trigger an event
     * @param {string} eventName - Name of event
     * @param {*}  event - Params for event Handles
     */
    this.trigger = function (eventName, event) {
        var key;
        for (key in registered[eventName]) {
            if (registered[eventName].hasOwnProperty(key)) {
                registered[eventName][key](event);
            }
        }
    };

    /**
     * Event handle
     * @callback eventCallback
     * @param {*} event - Params
     */

    /**
     * Register an event handle
     * @param {string} eventName
     * @param {string} handleName
     * @param {eventCallback} handle
     */
    this.on = function (eventName, handleName, handle) {
        if (!registered[eventName]) {
            registered[eventName] = {};
        }
        if (typeof handle !== 'function') {
            throw 'invalid event handle';
        }
        registered[eventName][handleName] = handle;
    };


    /**
     * Unregister an event handle
     * @param {string} eventName
     * @param {string} handleName
     */
    this.off = function (eventName, handleName) {
        if (!registered[eventName]) {
            return;
        }
        delete registered[eventName][handleName];
    };
};

/*global module*/
module.exports = Events;

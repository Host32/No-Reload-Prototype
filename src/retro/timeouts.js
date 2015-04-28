var Timeouts = function () {
    'use strict';
    var registered = {};

    this.register = function (name, func, time, cleanable) {
        if (cleanable === undefined) {
            cleanable = true;
        }

        registered[name] = {
            timeout: setTimeout(func, time),
            cleanable: cleanable
        };
    };
    this.clear = function (name) {
        if (registered[name] !== undefined) {
            clearTimeout(registered[name].timeout);
        }
    };
    this.clearAll = function () {
        var key;
        for (key in registered) {
            if (registered.hasOwnProperty(key) && registered[key].cleanable) {
                clearTimeout(registered[key].timeout);
            }
        }
    };
};

/*global module*/
module.exports = Timeouts;

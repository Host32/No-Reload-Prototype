var Intervals = function () {
    'use strict';
    var registered = {};

    this.register = function (name, func, time, cleanable) {
        if (cleanable === undefined) {
            cleanable = true;
        }

        registered[name] = {
            interval: setInterval(func, time),
            cleanable: cleanable
        };
    };
    this.clear = function (name) {
        if (registered[name] !== undefined) {
            clearInterval(registered[name].interval);
        }
    };
    this.clearAll = function () {
        var key;
        for (key in registered) {
            if (registered.hasOwnProperty(key) && registered[key].cleanable) {
                clearInterval(registered[key].interval);
            }
        }
    };
};

/*global module*/
module.exports = Intervals;

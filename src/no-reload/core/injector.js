/*global module, require*/
(function () {
    'use strict';

    var helpers = require('./helpers.js');

    function Injector() {
        this.dependencies = {};
        this.flashDependencies = {};
    }

    Injector.prototype.register = function (key, value) {
        this.dependencies[key] = value;
    };

    Injector.prototype.registerFlash = function (key, value) {
        this.flashDependencies[key] = value;
    };

    Injector.prototype.clearFlash = function () {
        this.flashDependencies = {};
    };

    Injector.prototype.resolve = function (definition, scope) {
        var func = function () {},
            deps = [],
            args = [],
            self = this;

        if (helpers.isFunction(definition)) {
            func = definition;
            deps = func.toString().match(/^[function\s]*[\(]*\(\s*([\w,\s]*)\)/m)[1].replace(/ /g, '').split(',');
        } else if (helpers.isArray(definition)) {
            func = definition[definition.length - 1];
            deps = definition.splice(-1, 1);
        }
        return function () {
            var i, d;
            for (i = 0; i < deps.length; i += 1) {
                d = deps[i];
                if (self.dependencies[d] && d !== '') {
                    args.push(self.dependencies[d]);
                }
                if (self.flashDependencies[d] && d !== '') {
                    args.push(self.flashDependencies[d]);
                }
            }
            func.apply(scope || {}, args);
        };
    };

    module.exports = Injector;
}());

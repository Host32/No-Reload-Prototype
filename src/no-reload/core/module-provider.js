/*global module, require*/
(function ($) {
    'use strict';
    var moduleFactory = require('./module'),

        modules = {},

        moduleProvider = function (name, deps) {
            if (!modules[name]) {
                modules[name] = moduleFactory(deps);
            }
            return modules[name];
        };

    module.exports = moduleProvider;
}(window.jQuery));

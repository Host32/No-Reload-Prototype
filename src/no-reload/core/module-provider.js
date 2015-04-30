/*global module, require*/
(function ($) {
    'use strict';
    var moduleFactory = require('./module');

    function moduleProvider() {
        var modules = {};

        function create(name, deps) {
            if (!modules[name]) {
                modules[name] = moduleFactory(deps);
            }
            return modules[name];
        }

        return {
            create: create
        };
    }
}(window.jQuery));

/*global module, require*/
(function () {
    'use strict';
    var helpers = require('./helpers'),
        isFunction = helpers.isFunction,
        isArray = helpers.isArray;

    function $ControllerProvider($injector) {
        var instance,
            controllers = {};

        function register(name, constructor) {
            controllers[name] = constructor;

            return instance;
        }

        function resolve(controller, scope) {
            if (isFunction(controller) || isArray(controller)) {
                $injector(controller, scope);
            } else if (controllers[controller]) {
                $injector(controllers[controller], scope);
            }
        }

        instance = {
            register: register,
            resolve: resolve
        };

        return instance;
    }

    module.exports = $ControllerProvider;
}());

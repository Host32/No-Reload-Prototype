/*global module, require*/
(function () {
    'use strict';
    var helpers = require('../helpers'),
        isFunction = helpers.isFunction,
        isArray = helpers.isArray;

    function $ControllerProvider($injector, $scriptLoader) {
        var instance,
            controllers = {},
            resolve,

            registerQueue = [];

        function resolveRegisterQueue() {
            if (registerQueue.length) {
                var controller = registerQueue.shift();
                resolve(controller.name, controller.scope);
            }
        }

        function register(name, constructor) {
            controllers[name] = constructor;

            resolveRegisterQueue();

            return instance;
        }

        function putOnRegisterQueue(name, scope) {
            registerQueue.push({
                name: name,
                scope: scope
            });
        }

        resolve = function (controller, scope, path) {
            if (isFunction(controller) || isArray(controller)) {
                $injector(controller, scope);
            } else if (controllers[controller]) {
                $injector(controllers[controller], scope);
            } else if (path) {
                $scriptLoader.load(path);
                putOnRegisterQueue(controller, scope);
            }
        };

        instance = {
            register: register,
            resolve: resolve
        };

        return instance;
    }

    module.exports = $ControllerProvider;
}());

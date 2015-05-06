/*global module, require*/
(function (Ractive) {
    'use strict';
    var helpers = require('../helpers'),
        isFunction = helpers.isFunction,
        isArray = helpers.isArray;

    function $ControllerProvider($injector, $scriptLoader) {
        var instance,
            controllers = {},
            resolve,

            registerQueue = {};

        function resolveSingleQueue(controller) {
            resolve(controller.name, controller.scope).then(function () {
                if (controller.callback) {
                    controller.callback();
                }
            });
        }

        function resolveRegisterQueue(name) {
            if (registerQueue[name]) {
                var i, controller;
                for (i = 0; i < registerQueue[name].length; i += 1) {
                    controller = registerQueue[name][i];
                    resolveSingleQueue(controller);
                }
                delete registerQueue[name];
            }
        }

        function register(name, constructor) {
            controllers[name] = constructor;

            resolveRegisterQueue(name);

            return instance;
        }

        function putOnRegisterQueue(name, scope, callback) {
            if (!registerQueue[name]) {
                registerQueue[name] = [];
            }
            registerQueue[name].push({
                name: name,
                scope: scope,
                callback: callback
            });
        }

        resolve = function (controller, scope, path) {
            return new Ractive.Promise(function (resolve, reject) {
                if (isFunction(controller) || isArray(controller)) {
                    $injector(controller, scope).then(function () {
                        resolve();
                    });
                } else if (controllers[controller]) {
                    $injector(controllers[controller], scope).then(function () {
                        resolve();
                    });
                } else if (path) {
                    $scriptLoader.load(path);
                    putOnRegisterQueue(controller, scope, resolve);
                }
            });
        };

        instance = {
            register: register,
            resolve: resolve
        };

        return instance;
    }

    module.exports = $ControllerProvider;
}(window.Ractive));

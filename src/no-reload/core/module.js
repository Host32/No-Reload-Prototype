/*global module, require*/
(function (Ractive) {
    'use strict';
    var $Injector = require('./injector'),
        $Ajax = require('../remote/ajax'),
        $ScriptLoader = require('../remote/script-loader'),
        $Server = require('../remote/server'),
        $TemplateProvider = require('../template/template-provider'),
        $ControllerProvider = require('./controller-provider'),
        $RouteResolver = require('./route-resolver'),
        $StateProvider = require('./state-provider'),
        helpers = require('../helpers'),
        isString = helpers.isString,
        isFunction = helpers.isFunction,
        isArray = helpers.isArray;

    function Module() {
        var instance,
            $injector = $Injector(),
            $scriptLoader = $ScriptLoader(),
            configs = [],
            runnables = [];

        $injector.get = $scriptLoader.load;

        $injector("$injector", function () {
            return $injector;
        });
        $injector("$scriptLoader", function () {
            return $scriptLoader;
        });

        $injector("$ajax", $Ajax);
        $injector("$server", $Server);
        $injector("$controllerProvider", $ControllerProvider);
        $injector("$templateProvider", $TemplateProvider);
        $injector("$routeResolver", $RouteResolver);
        $injector("$stateProvider", $StateProvider);

        function factory(name, constructor) {
            if (!isString(name)) {
                throw 'invalid service name';
            }
            if (!isFunction(constructor) && !isArray(constructor)) {
                throw 'invalid service constructor';
            }

            $injector(name, constructor);

            return instance;
        }

        function controller(name, constructor) {
            $injector(function ($controllerProvider) {
                $controllerProvider.register(name, constructor);
            });

            return instance;
        }

        function state(name, definition) {
            $injector(function ($stateProvider) {
                $stateProvider.register(name, definition);
            });

            return instance;
        }

        function partial(name, definition) {
            $injector(function ($templateProvider) {
                $templateProvider.partial(name, definition);
            });

            return instance;
        }

        function component(name, definition) {
            $injector(function ($templateProvider) {
                $templateProvider.component(name, definition);
            });

            return instance;
        }

        function route(url, stateName, statePath) {
            if (!url) {
                $injector(function ($stateProvider) {
                    $stateProvider.registerPath(stateName, statePath);
                });
            } else {
                $injector(function ($routeResolver) {
                    $routeResolver.register(url, stateName, statePath);
                });
            }

            return instance;
        }

        function go(state, params, stateDepsPaths) {
            $injector(function ($stateProvider) {
                $stateProvider.go(state, params, stateDepsPaths);
            });

            return instance;
        }

        function goToUrl(url) {
            $injector(function ($stateProvider, $routeResolver) {
                var urlObj = $routeResolver.resolve(url);

                if (urlObj) {
                    $stateProvider.go(urlObj.stateName, urlObj.params, urlObj.statePath);
                }
            });

            return instance;
        }

        function isRegisteredState(name) {
            var $stateProvider = $injector.getDependency('$stateProvider');
            return $stateProvider.isRegisteredState(name);
        }

        function isRegisteredUrl(url) {
            var $routeResolver = $injector.getDependency('$routeResolver');
            return $routeResolver.isRegistered(url);
        }

        function config(func) {
            configs.push(func);

            return instance;
        }

        function configPhase() {
            return new Ractive.Promise(function (resolve, reject) {
                if (configs.length === 0) {
                    resolve();
                }
                var i,
                    pendents = configs.length,

                    execOne = function (i) {
                        $injector(configs[i]).then(function () {
                            pendents -= 1;

                            if (!pendents) {
                                resolve();
                            }
                        });
                    };
                for (i = 0; i < configs.length; i += 1) {
                    execOne(i);
                }
            });
        }

        function run(func) {
            runnables.push(func);

            return instance;
        }

        function runPhase() {
            var i;
            for (i = 0; i < runnables.length; i += 1) {
                $injector(runnables[i]);
            }
        }

        function start() {
            configPhase().then(function () {
                runPhase();
            });
        }

        instance = {
            factory: factory,
            controller: controller,
            state: state,
            route: route,
            component: component,
            partial: partial,
            go: go,
            goToUrl: goToUrl,
            run: run,
            config: config,
            isRegisteredState: isRegisteredState,
            isRegisteredUrl: isRegisteredUrl,
            start: start
        };

        return instance;
    }

    module.exports = Module;
}(window.Ractive));

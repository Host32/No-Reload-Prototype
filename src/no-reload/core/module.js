/*global module, require*/
(function () {
    'use strict';
    var $Injector = require('./injector'),
        $Ajax = require('../remote/ajax'),
        $ScriptLoader = require('../remote/script-loader'),
        $Server = require('../remote/server'),
        $TemplateProvider = require('../template/template-provider'),
        $ControllerProvider = require('./controller-provider'),
        $RouteResolver = require('./route-resolver'),
        $StateProvider = require('./state-provider');

    function Module(path) {
        var instance,
            $injector = $Injector(),
            $scriptLoader = $ScriptLoader(),
            configs = [],
            runnables = [],

            onUrlChange;

        $scriptLoader.setDefaultPath(path || '');
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
            if (typeof name !== 'string') {
                throw 'invalid service name';
            }
            if (typeof constructor !== 'function') {
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
            $injector(function ($routeResolver) {
                $routeResolver.register(url, stateName, statePath);
            });

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
                    $stateProvider.go(urlObj.stateName, urlObj.params, urlObj.stateDepsPaths);
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

        function run(func) {
            runnables.push(func);
            return instance;
        }

        function configPhase() {
            var i;
            for (i = 0; i < configs.length; i += 1) {
                $injector(configs[i]);
            }
        }

        function runPhase() {
            var i;
            for (i = 0; i < runnables.length; i += 1) {
                $injector(runnables[i]);
            }
        }

        onUrlChange = function (url) {
            goToUrl(url);
        };

        function start() {
            configPhase();
            runPhase();
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
            config: config,
            run: run,
            isRegisteredState: isRegisteredState,
            isRegisteredUrl: isRegisteredUrl,
            onUrlChange: onUrlChange,
            start: start
        };

        return instance;
    }

    module.exports = Module;
}());

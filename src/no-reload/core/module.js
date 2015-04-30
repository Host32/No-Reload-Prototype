/*global module, require*/
(function ($) {
    'use strict';
    var $Injector = require('./injector'),
        $Ajax = require('../remote/ajax'),
        $Server = require('../remote/server'),
        $TemplateProvider = require('../template/template-provider'),
        $ControllerProvider = require('./controller-provider'),
        $UrlResolver = require('./url-resolver'),
        $StateProvider = require('./state-provider');

    function Module(deps) {
        var instance,
            $injector = $Injector(),
            configs = [],
            runnables = [],

            onUrlChange;

        $injector("$injector", function () {
            return $injector;
        });

        $injector("$ajax", $Ajax);
        $injector("$server", $Server);
        $injector("$controllerProvider", $ControllerProvider);
        $injector("$templateProvider", $TemplateProvider);
        $injector("$urlResolver", $UrlResolver);
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

        function go(state, params) {
            $injector(function ($stateProvider) {
                $stateProvider.go(state, params);
            });

            return instance;
        }

        function goToUrl(url) {
            $injector(function ($stateProvider) {
                $stateProvider.goToUrl(url);
            });

            return instance;
        }

        function isRegisteredState(name) {
            var $stateProvider = $injector.getDependency('$stateProvider');
            return $stateProvider.isRegisteredState(name);
        }

        function isRegisteredUrl(url) {
            var $stateProvider = $injector.getDependency('$stateProvider');
            return $stateProvider.isRegisteredUrl(url);
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
}(window.jQuery));

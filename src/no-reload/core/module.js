/*global module, require*/
(function ($) {
    'use strict';
    var $Injector = require('./injector'),
        $Ajax = require('./ajax'),
        $Server = require('./server'),
        $ControllerProvider = require('./controller-provider'),
        $TemplateProvider = require('./template-provider'),
        $StateProvider = require('./state-provider');

    function Module(deps) {
        var $injector = $Injector(),
            instance;

        $injector("$injector", function () {
            return $injector;
        });

        $injector("$ajax", $Ajax);

        $injector("$server", $Server);

        $injector("$controllerProvider", $ControllerProvider);

        $injector("$templateProvider", $TemplateProvider);

        $injector("$stateProvider", $StateProvider);

        function service(name, constructor) {
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

        instance = {
            service: service,
            controller: controller
        };

        return instance;
    }
}(window.jQuery));
